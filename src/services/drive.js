/**
 * 🍄 MYCOVITA OS v2.0 - DRIVE SERVICE
 * Google Drive dosya işleme ve AI sınıflandırma
 */

const config = require('../config');
const folderMap = require('../config/folders');
const { getDrive, getAccessToken } = require('../config/google-auth');
const AIService = require('./ai');
const LogService = require('./log');

function toEnglishUpper(str) {
  if (!str) return 'BILINMEYEN';
  const map = { ç: 'C', Ç: 'C', ğ: 'G', Ğ: 'G', ı: 'I', İ: 'I', ö: 'O', Ö: 'O', ş: 'S', Ş: 'S', ü: 'U', Ü: 'U' };
  return str.split('').map(c => map[c] || c).join('').toUpperCase();
}

async function processInbox() {
  await LogService.info('Drive INBOX tarama başladı...');
  const logs = [];

  try {
    const drive = await getDrive();
    const res = await drive.files.list({
      q: `'${config.driveInboxId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, size)',
      pageSize: config.batchSizeDrive
    });

    const files = res.data.files || [];
    if (files.length === 0) {
      await LogService.info('INBOX boş, işlenecek dosya yok');
      return ['ℹ️ INBOX boş'];
    }

    for (const file of files) {
      try {
        await LogService.info('Dosya analiz ediliyor: ' + file.name);
        logs.push('📄 ' + file.name);

        // Dosyayı base64 olarak çek
        let fileBase64 = null;
        try {
          const token = await getAccessToken();
          let exportUrl;

          if (file.mimeType === 'application/vnd.google-apps.document') {
            exportUrl = `https://docs.google.com/document/d/${file.id}/export?format=pdf`;
          } else if (file.mimeType === 'application/vnd.google-apps.spreadsheet') {
            exportUrl = `https://docs.google.com/spreadsheets/d/${file.id}/export?format=pdf`;
          }

          if (exportUrl) {
            const pdfRes = await fetch(exportUrl, { headers: { Authorization: 'Bearer ' + token } });
            if (pdfRes.ok) {
              const buffer = await pdfRes.arrayBuffer();
              fileBase64 = Buffer.from(buffer).toString('base64');
            }
          } else {
            const dlRes = await drive.files.get({ fileId: file.id, alt: 'media' }, { responseType: 'arraybuffer' });
            fileBase64 = Buffer.from(dlRes.data).toString('base64');
          }
        } catch (e) {
          console.error('Dosya indirme hatası (' + file.name + '):', e.message);
        }

        // AI analizi
        const analysis = await AIService.analyze(fileBase64, file.mimeType || 'application/pdf', file.name);
        const docType = analysis?.document_type || 'UNKNOWN';
        const folderInfo = folderMap[docType] || folderMap.UNKNOWN;

        // Dosya adını güncelle
        let newName = file.name;
        if (analysis?.suggested_filename) {
          const ext = file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.')) : '';
          newName = toEnglishUpper(analysis.suggested_filename).replace(/[\\/:*?"<>|]/g, '_').substring(0, 200) + ext;
        }

        // Dosyayı hedef klasöre taşı
        await drive.files.update({
          fileId: file.id,
          addParents: folderInfo.folderId,
          removeParents: config.driveInboxId,
          requestBody: {
            name: newName,
            description: '🤖 MYCO-AI v2.0\n📂 ' + docType + '\n📝 ' + (analysis?.summary || 'Özet yok')
          }
        });

        await LogService.write(newName, 'BAŞARILI', '→ ' + docType + ' (' + folderInfo.description + ')');
        logs.push('  ✅ → ' + docType);

      } catch (e) {
        await LogService.error('Dosya işleme hatası (' + file.name + '): ' + e.message);
        logs.push('  ❌ Hata: ' + e.message);
      }
    }

    await LogService.info('Drive tarama tamamlandı: ' + files.length + ' dosya işlendi');
    logs.push('📂 Toplam: ' + files.length + ' dosya işlendi');
  } catch (e) {
    await LogService.error('Drive INBOX hatası: ' + e.message);
    logs.push('❌ Drive erişim hatası: ' + e.message);
  }

  return logs;
}

module.exports = { processInbox, toEnglishUpper };
