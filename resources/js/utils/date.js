const GOOGLE_SHEETS_EPOCH = Date.UTC(1899, 11, 30);

const toCanonicalDate = (year, month, day) => {
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
        date.getUTCFullYear() !== year
        || date.getUTCMonth() !== month - 1
        || date.getUTCDate() !== day
    ) return '';

    return date.toISOString().slice(0, 10);
};

export const normalizeDate = (value) => {
    if (value === null || value === undefined || value === '') return '';

    const rawDate = String(value).trim();
    if (!rawDate) return '';

    if (/^\d+(?:\.\d+)?$/.test(rawDate)) {
        const serial = Number(rawDate);
        if (serial > 0 && serial < 100000) {
            const date = new Date(GOOGLE_SHEETS_EPOCH + Math.floor(serial) * 86400000);
            return date.toISOString().slice(0, 10);
        }
    }

    let match = rawDate.match(/^(\d{1,2})\s*([\/-])\s*(\d{1,2})\s*\2\s*(\d{4})/);
    if (match) return toCanonicalDate(Number(match[4]), Number(match[3]), Number(match[1]));

    match = rawDate.match(/^(\d{4})\s*([\/-])\s*(\d{1,2})\s*\2\s*(\d{1,2})/);
    if (match) return toCanonicalDate(Number(match[1]), Number(match[3]), Number(match[4]));

    const parsed = new Date(rawDate);
    return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
};

export const formatDate = (value, options = {}) => {
    const normalizedDate = normalizeDate(value);
    if (!normalizedDate) return '-';

    const [year, month, day] = normalizedDate.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return new Intl.DateTimeFormat('id-ID', {
        timeZone: 'UTC',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        ...options,
    }).format(date);
};
