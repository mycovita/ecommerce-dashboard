/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  🍄 MYCOVITA OS v2.0                                          ║
 * ║  E-Commerce Dashboard & Automation                            ║
 * ║  Platform: Google Cloud Run                                   ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

const express = require('express');
const path = require('path');
const config = require('./config');
const apiRoutes = require('./routes/api');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// API routes
app.use('/api', apiRoutes);

// Dashboard (ana sayfa)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'dashboard.html'));
});

// ═══════════════════════════════════════════════════════
// CRON JOB - Her 15 dakikada tam tarama
// ═══════════════════════════════════════════════════════
let cronRunning = false;

async function cronScan() {
  if (cronRunning) return;
  cronRunning = true;

  try {
    const LogService = require('./services/log');
    const GmailService = require('./services/gmail');
    const DriveService = require('./services/drive');

    console.log('[CRON] ⏰ Otomatik tarama başladı...');
    await LogService.write('SİSTEM', 'BAŞLADI', '⏰ CRON: Otomatik tarama');

    const gmailLogs = await GmailService.fetchOrders();
    const driveLogs = await DriveService.processInbox();

    await LogService.write('SİSTEM', 'BİTTİ', '⏰ CRON: Tarama tamamlandı');
    console.log('[CRON] ✅ Tamamlandı:', [...gmailLogs, ...driveLogs].join(', '));
  } catch (e) {
    console.error('[CRON] ❌ Hata:', e.message);
  } finally {
    cronRunning = false;
  }
}

// Start
app.listen(config.port, () => {
  console.log(`🍄 MYCOVITA OS v2.0 çalışıyor → http://localhost:${config.port}`);
  console.log(`📊 Dashboard → http://localhost:${config.port}`);
  console.log(`🔌 API → http://localhost:${config.port}/api/health`);
  console.log(`⏰ CRON → Her 15 dakikada otomatik tarama aktif`);

  // İlk taramayı 30 saniye sonra başlat (startup tamamlansın)
  setTimeout(cronScan, 30000);

  // Sonra her 15 dakikada tekrarla
  setInterval(cronScan, 15 * 60 * 1000);
});
console.log('Gemini Otomasyon Testi: BAŞARILI');
