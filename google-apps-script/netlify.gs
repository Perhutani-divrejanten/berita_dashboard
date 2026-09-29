/**
 * Trigger installable "On edit" untuk perubahan langsung di Sheet.
 */
function onEditTrigger(e) {
  try {
    const range = e && e.range;
    if (!range) return;

    const editedColumn = canonicalColumn(
      range.getSheet().getRange(1, range.getColumn()).getValue()
    );
    const allowedColumns = [
      'title', 'content', 'category', 'date', 'image',
      'badge', 'excerpt', 'author', 'slug', 'true', 'publish_at'
    ];

    if (!allowedColumns.includes(editedColumn)) {
      Logger.log('Edit di kolom non-artikel ("' + editedColumn + '"); trigger dilewati.');
      return;
    }

    Logger.log('Edit kolom "' + editedColumn + '" terdeteksi. Memicu Netlify build.');
    triggerAllNetlifyBuilds();
  } catch (error) {
    Logger.log('onEditTrigger error: ' + error.message);
  }
}

/**
 * Memicu semua build hook. Kegagalan satu website tidak menghentikan hook lain.
 */
function triggerAllNetlifyBuilds() {
  const configuredHooks = PropertiesService.getScriptProperties()
    .getProperty('NETLIFY_BUILD_HOOKS');
  const hooks = configuredHooks ? configuredHooks.split(',').map(url => url.trim()).filter(Boolean) : [];

  if (hooks.length === 0) {
    Logger.log('Tidak ada Netlify hook yang dikonfigurasi.');
    return;
  }

  let successCount = 0;
  let failureCount = 0;

  hooks.forEach((url, index) => {
    try {
      const response = UrlFetchApp.fetch(url, {
        method: 'post',
        muteHttpExceptions: true
      });
      const status = response.getResponseCode();

      if (status >= 200 && status < 300) {
        successCount++;
        Logger.log('Hook #' + (index + 1) + ' berhasil (HTTP ' + status + ').');
      } else {
        failureCount++;
        Logger.log('Hook #' + (index + 1) + ' gagal (HTTP ' + status + ').');
      }
    } catch (error) {
      failureCount++;
      Logger.log('Hook #' + (index + 1) + ' error: ' + error.message);
    }
  });

  Logger.log(
    'Netlify selesai. Berhasil: ' + successCount + ', gagal: ' + failureCount + '.'
  );
}

/**
 * Jalankan manual dari editor Apps Script untuk menguji semua hook.
 */
function testTriggerNetlify() {
  triggerAllNetlifyBuilds();
}
