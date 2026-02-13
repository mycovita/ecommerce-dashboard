/**
 * 🍄 MYCOVITA OS v2.0 - DRIVE SERVICE
 */
const config = require('../config');
const folderMap = require('../config/folders');
const { getDrive, getAccessToken } = require('../config/google-auth');
const AIService = require('./ai');
const LogService = require('./log');

function toEnglishUpper(str) {
  if (!str) return 'BILINMEYEN';
  const charMap = { 'ç': 'C', 'Ç': 'C', 'ğ': 'G', 'Ğ': 'G', 'ı': 'I', 'İ': 'I', 'ö': 'O', 'Ö': 'O', 'ş': 'S', 'Ş': 'S', 'ü': 'U', 'Ü': 'U' };
  return str.split('').map(c => charMap[c] || c).join('').toUpperCase();
}

async function processInbox() {
  await LogService.info('Drive INBOX tarama başladı...');
  const logs = [];
  try {
    const drive = await getDrive();
    const res = await drive.files.list({
      q: "'${config.driveInboxId}' in parents and trashed = false",
      fields: 'files(id, name, mimeType, size)',
      pageSize: config.batchSizeDrive
    });
    const files = res.data.files || [];
    if (files.length === 0) { return ['ℹ️ INBOX boş']; }

    for (const file of files) {
      try {
        await LogService.info(`Dosya analiz ediliyor: ${file.name}`);
        let fileBase64 = null;
        const dlRes = await drive.files.get({ fileId: file.id, alt: 'media' }, { responseType: 'arraybuffer' });
        fileBase64 = Buffer.from(dlRes.data).toString('base64');

        const analysis = await AIService.analyze(fileBase64, file.mimeType, file.name);
        const docType = analysis?.document_type || 'UNKNOWN';
        const folderInfo = folderMap[docType] || folderMap.UNKNOWN;

        let newName = analysis?.suggested_filename ? toEnglishUpper(analysis.suggested_filename) : file.name;
        
        await drive.files.update({
          fileId: file.id,
          addParents: folderInfo.folderId,
          removeParents: config.driveInboxId,
          requestBody: { name: newName }
        });
        logs.push(`✅ ${newName} -> ${docType}`);
      } catch (err) { logs.push(`❌ ${file.name}: ${err.message}`); }
    }
  } catch (e) { logs.push('❌ Drive Hatası'); }
  return logs;
}
module.exports = { processInbox, toEnglishUpper };
