const SHEET_NAME = 'data';

// Nama internal field. Header Sheet boleh memakai TRUE atau true.
const COLUMNS = [
  'slug',
  'title',
  'date',
  'category',
  'badge',
  'image',
  'excerpt',
  'content',
  'author',
  'true',
  'publish_at'
];

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};

  if (params.token || params.action) {
    return jsonResponse({
      success: false,
      message: 'Operasi API harus menggunakan POST.'
    });
  }

  return legacyGetArray();
}

function doPost(e) {
  return handleCrud(parsePostBody(e));
}

function legacyGetArray() {
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return jsonResponse([]);

  const headers = values.shift().map(String);
  const rows = values
    .filter(row => row[0] !== '')
    .map(row => rowToObject(headers, row))
    .filter(row => normalizePublicationValue(row.true ?? row.TRUE ?? row.is_published) === 'TRUE');

  return jsonResponse(rows);
}

function handleCrud(params) {
  try {
    const expectedToken = PropertiesService.getScriptProperties().getProperty('SHEETS_API_TOKEN');
    if (!expectedToken || !params.token || params.token !== expectedToken) {
      return jsonResponse({
        success: false,
        message: 'Token tidak valid atau tidak disertakan'
      });
    }

    switch (params.action || '') {
      case 'list':
        return jsonResponse(listBerita());
      case 'get':
        return jsonResponse(getBerita(params.slug));
      case 'create':
        return jsonResponse(createBerita(params));
      case 'upsert':
        return jsonResponse(upsertBerita(params));
      case 'update':
        return jsonResponse(updateBerita(params));
      case 'delete':
        return jsonResponse(deleteBerita(params.slug));
      default:
        return jsonResponse({
          success: false,
          message: 'Action tidak dikenal. Gunakan: list, get, create, update, delete'
        });
    }
  } catch (error) {
    Logger.log('Google Sheets CRUD error: ' + error.message);
    return jsonResponse({
      success: false,
      message: 'Server error'
    });
  }
}

function listBerita() {
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return { success: true, total: 0, data: [] };
  }

  const headers = values[0].map(String);
  const result = values
    .slice(1)
    .filter(row => row[0] !== '')
    .map(row => rowToObject(headers, row));

  result.sort((first, second) => dateSortValue(second.date) - dateSortValue(first.date));

  return { success: true, total: result.length, data: result };
}

function dateSortValue(value) {
  if (value instanceof Date && !isNaN(value.getTime())) return value.getTime();

  const rawDate = String(value || '').trim();
  let match = rawDate.match(/^(\d{1,2})\s*[\/-]\s*(\d{1,2})\s*[\/-]\s*(\d{4})/);
  if (match) return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1])).getTime();

  match = rawDate.match(/^(\d{4})\s*[\/-]\s*(\d{1,2})\s*[\/-]\s*(\d{1,2})/);
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).getTime();

  const parsed = new Date(rawDate);
  return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function getBerita(slug) {
  if (!slug) {
    return { success: false, message: 'Parameter slug wajib diisi' };
  }

  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);

  for (let index = 1; index < values.length; index++) {
    if (String(values[index][0]).trim() === String(slug).trim()) {
      return {
        success: true,
        data: rowToObject(headers, values[index]),
        rowIndex: index + 1
      };
    }
  }

  return {
    success: false,
    message: 'Berita dengan slug "' + slug + '" tidak ditemukan'
  };
}

function createBerita(params) {
  const result = withScriptLock(() => createBeritaLocked(params));
  if (result.success) triggerAllNetlifyBuilds();

  return result;
}

function createBeritaLocked(params, knownExisting) {
  if (!params.title) {
    return { success: false, message: 'Field "title" wajib diisi' };
  }

  const slug = params.slug ? slugify(params.slug) : generateNextSlug();
  if (!slug) {
    return { success: false, message: 'Gagal generate slug dari title' };
  }

  const existing = knownExisting || getBerita(slug);
  if (existing.success) {
    return { success: false, message: 'Slug "' + slug + '" sudah ada. Gunakan title lain.' };
  }

  const newRow = getHeaders().map(header => {
    const column = canonicalColumn(header);
    if (column === 'slug') return slug;
    if (column === 'true') return normalizePublicationValue(params[column]);
    return params[column] !== undefined ? params[column] : '';
  });

  getSheet().appendRow(newRow);

  return {
    success: true,
    message: 'Berita berhasil ditambahkan',
    data: { slug: slug }
  };
}

function upsertBerita(params) {
  if (!params.title) {
    return { success: false, message: 'Field "title" wajib diisi' };
  }

  const result = withScriptLock(() => {
    const slug = params.slug ? slugify(params.slug) : '';
    const normalizedParams = Object.assign({}, params, { slug: slug });
    const existing = slug ? getBerita(slug) : { success: false };

    return existing.success
      ? updateBeritaLocked(normalizedParams, existing)
      : createBeritaLocked(normalizedParams, slug ? existing : null);
  });

  if (result.success) triggerAllNetlifyBuilds();

  return result;
}

function withScriptLock(callback) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    return { success: false, message: 'Data sedang diperbarui. Silakan coba kembali.' };
  }

  try {
    return callback();
  } finally {
    lock.releaseLock();
  }
}

function generateNextSlug() {
  const values = getSheet().getDataRange().getValues();
  let highestNumber = 0;
  let dataRowCount = 0;

  values.slice(1).forEach(row => {
    if (row[0] === '') return;

    dataRowCount++;
    const match = String(row[0]).match(/^berita(\d+)-f$/i);
    if (match) {
      highestNumber = Math.max(highestNumber, Number(match[1]));
    }
  });

  const nextNumber = Math.max(highestNumber, dataRowCount) + 1;
  return 'berita' + nextNumber + '-f';
}

function updateBerita(params) {
  const result = withScriptLock(() => updateBeritaLocked(params));
  if (result.success) triggerAllNetlifyBuilds();

  return result;
}

function updateBeritaLocked(params, knownExisting) {
  if (!params.slug) {
    return { success: false, message: 'Parameter slug wajib diisi untuk update' };
  }

  const existing = knownExisting || getBerita(params.slug);
  if (!existing.success) {
    return { success: false, message: existing.message };
  }

  const headers = getHeaders();
  const updatedRow = headers.map(header => {
    const column = canonicalColumn(header);
    if (column === 'slug') return existing.data.slug;
    if (column === 'true') {
      return params[column] !== undefined
        ? normalizePublicationValue(params[column])
        : normalizePublicationValue(existing.data[column]);
    }
    return params[column] !== undefined ? params[column] : existing.data[column];
  });

  getSheet()
    .getRange(existing.rowIndex, 1, 1, headers.length)
    .setValues([updatedRow]);

  return {
    success: true,
    message: 'Berita berhasil diupdate',
    data: { slug: existing.data.slug }
  };
}

function deleteBerita(slug) {
  const result = withScriptLock(() => deleteBeritaLocked(slug));
  if (result.success) triggerAllNetlifyBuilds();

  return result;
}

function deleteBeritaLocked(slug) {
  if (!slug) {
    return { success: false, message: 'Parameter slug wajib diisi untuk delete' };
  }

  const existing = getBerita(slug);
  if (!existing.success) {
    return { success: false, message: existing.message };
  }

  getSheet().deleteRow(existing.rowIndex);

  return {
    success: true,
    message: 'Berita berhasil dihapus',
    data: { slug: slug }
  };
}

function getSheet() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('Sheet "' + SHEET_NAME + '" tidak ditemukan');
  }

  return sheet;
}

function getHeaders() {
  const sheet = getSheet();
  const headers = sheet.getRange(1, 1, 1, COLUMNS.length).getValues()[0].map(String);
  validateHeaders(sheet);

  return headers;
}

function canonicalColumn(header) {
  const normalized = String(header || '').trim().toLowerCase();
  return normalized === 'true' ? 'true' : normalized;
}

function validateHeaders(sheet) {
  const headers = sheet.getRange(1, 1, 1, COLUMNS.length).getValues()[0];
  const normalized = headers.map(canonicalColumn);
  const missing = COLUMNS.filter(column => !normalized.includes(column));
  const duplicates = normalized.filter((column, index) => normalized.indexOf(column) !== index);

  if (missing.length > 0) {
    throw new Error('Header Sheet kurang: ' + missing.join(', '));
  }

  if (duplicates.length > 0) {
    throw new Error('Header Sheet duplikat: ' + [...new Set(duplicates)].join(', '));
  }
}

function rowToObject(headers, row) {
  const object = {};
  headers.forEach((header, index) => {
    const column = canonicalColumn(header);
    if (!COLUMNS.includes(column)) return;

    if (column === 'image') {
      object[column] = normalizeImageUrl(row[index]);
    } else if (column === 'true') {
      object[column] = normalizePublicationValue(row[index]);
    } else if (column) {
      object[column] = row[index];
    }
  });
  return object;
}

function normalizePublicationValue(value) {
  const normalized = String(value === true ? 'TRUE' : value === false ? 'FALSE' : value || '')
    .trim()
    .toUpperCase();

  return ['TRUE', '1', 'YES', 'YA'].includes(normalized) ? 'TRUE' : 'FALSE';
}

function normalizePublicationColumn() {
  const sheet = getSheet();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(canonicalColumn);
  const columnIndex = headers.indexOf('true');

  if (columnIndex < 0 || sheet.getLastRow() < 2) return;

  const range = sheet.getRange(2, columnIndex + 1, sheet.getLastRow() - 1, 1);
  const values = range.getValues().map(row => [normalizePublicationValue(row[0])]);
  range.setValues(values);
}

function normalizeImageUrl(value) {
  const image = String(value || '').trim();
  if (!image) return '';

  const fileMatch = image.match(/^https?:\/\/drive\.google\.com\/file\/d\/([^/]+)/i);
  const queryMatch = image.match(/^https?:\/\/drive\.google\.com\/(?:open|uc)\?.*\bid=([^&]+)/i);
  const fileId = fileMatch ? fileMatch[1] : queryMatch ? queryMatch[1] : '';

  if (fileId) {
    return 'https://drive.google.com/uc?export=view&id=' + fileId;
  }

  return image;
}

function parsePostBody(e) {
  if (!e) return {};

  if (e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (_) {
      return e.parameter || {};
    }
  }

  return e.parameter || {};
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function jsonResponse(object) {
  return ContentService
    .createTextOutput(JSON.stringify(object))
    .setMimeType(ContentService.MimeType.JSON);
}
