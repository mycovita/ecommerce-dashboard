/**
 * 🍄 MYCOVITA OS v2.0 - GMAIL SERVICE
 * Gmail sipariş tarama
 */

const config = require('../config');
const { getGmail, getDrive } = require('../config/google-auth');
const MarketplaceService = require('./marketplace');
const LogService = require('./log');

async function fetchOrders() {
  await LogService.info('Gmail tarama başladı...');
  const logs = [];

  try {
    const gmail = await getGmail();
    const drive = await getDrive();

    // SIPARISLER etiketini bul
    const labelsRes = await gmail.users.labels.list({ userId: 'me' });
    const labels = labelsRes.data.labels || [];
    const orderLabel = labels.find(l => l.name === config.gmailLabel);
    const processedLabel = labels.find(l => l.name === config.gmailProcessedLabel);

    if (!orderLabel) {
      await LogService.warning(`'${config.gmailLabel}' etiketi bulunamadı`);
      return [`⚠️ '${config.gmailLabel}' etiketi yok.`];
    }

    // Processed label yoksa oluştur
    let processedLabelId = processedLabel?.id;
    if (!processedLabelId) {
      const created = await gmail.users.labels.create({
        userId: 'me',
        requestBody: { name: config.gmailProcessedLabel, labelListVisibility: 'labelShow', messageListVisibility: 'show' }
      });
      processedLabelId = created.data.id;
      await LogService.info('MYCO-ISLENDI etiketi oluşturuldu');
    }

    // Etiketli mesajları getir (işlenmemiş olanları)
    const msgsRes = await gmail.users.messages.list({
      userId: 'me',
      labelIds: [orderLabel.id],
      maxResults: config.batchSizeGmail,
      q: `-label:${config.gmailProcessedLabel}`
    });

    const messages = msgsRes.data.messages || [];
    if (messages.length === 0) {
      await LogService.info('Yeni sipariş maili yok');
      return ['ℹ️ Gmail: Yeni mail yok.'];
    }

    await LogService.info(`${messages.length} mail bulundu`);
    let orderCount = 0, fileCount = 0;

    for (const msgRef of messages) {
      try {
        const msg = await gmail.users.messages.get({ userId: 'me', id: msgRef.id, format: 'full' });
        const headers = msg.data.payload?.headers || [];
        const from = headers.find(h => h.name === 'From')?.value || '';
        const subject = headers.find(h => h.name === 'Subject')?.value || '';

        await LogService.info(`Mail: ${subject.substring(0, 50)}...`);

        // Body çıkar
        const body = extractBody(msg.data.payload);

        // Sipariş maili mi?
        const isOrder = ['siparis', 'order', 'trendyol', 'hepsiburada', 'amazon', 'sipariş']
          .some(kw => (from + subject).toLowerCase().includes(kw));

        if (isOrder) {
          const order = await MarketplaceService.processOrderEmail(from, subject, body);
          if (order) {
            orderCount++;
            await LogService.success(`Sipariş işlendi: ${order.order_id}`);
          }
        }

        // Ekleri Drive'a kaydet
        const attachments = extractAttachments(msg.data.payload);
        for (const att of attachments) {
          try {
            const attData = await gmail.users.messages.attachments.get({
              userId: 'me', messageId: msgRef.id, id: att.attachmentId
            });
            const fileBuffer = Buffer.from(attData.data.data, 'base64');

            await drive.files.create({
              requestBody: { name: att.filename, parents: [config.driveInboxId] },
              media: { mimeType: att.mimeType, body: require('stream').Readable.from(fileBuffer) }
            });
            fileCount++;
            await LogService.success(`Ek kaydedildi: ${att.filename}`);
          } catch (e) {
            await LogService.error(`Ek kaydetme hatası: ${e.message}`);
          }
        }

        // İşlendi etiketi ekle
        await gmail.users.messages.modify({
          userId: 'me', id: msgRef.id,
          requestBody: { addLabelIds: [processedLabelId] }
        });

      } catch (e) {
        await LogService.error(`Mail hatası: ${e.message}`);
      }
    }

    if (orderCount > 0) logs.push(`✅ ${orderCount} sipariş işlendi`);
    if (fileCount > 0) logs.push(`✅ ${fileCount} dosya kaydedildi`);
    await LogService.info(`Gmail tarama tamamlandı: ${orderCount} sipariş, ${fileCount} dosya`);

  } catch (e) {
    await LogService.error('Gmail hatası: ' + e.message);
    logs.push('❌ Gmail erişim hatası');
  }

  return logs.length > 0 ? logs : ['ℹ️ Gmail: Yeni mail yok.'];
}

// E-posta body'sini çıkar (text/plain veya text/html)
function extractBody(payload) {
  if (!payload) return '';
  if (payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
    }
    for (const part of payload.parts) {
      const result = extractBody(part);
      if (result) return result;
    }
  }
  return '';
}

// E-posta eklerini çıkar
function extractAttachments(payload) {
  const attachments = [];
  if (!payload) return attachments;
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.filename && part.body?.attachmentId) {
        attachments.push({
          filename: part.filename,
          mimeType: part.mimeType,
          attachmentId: part.body.attachmentId,
          size: part.body.size
        });
      }
      attachments.push(...extractAttachments(part));
    }
  }
  return attachments;
}

module.exports = { fetchOrders };
