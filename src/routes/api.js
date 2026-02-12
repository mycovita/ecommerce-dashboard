/**
 * 🍄 MYCOVITA OS v2.0 - API ROUTES
 * REST API endpoints
 */

const express = require('express');
const router = express.Router();

const StatsService = require('../services/stats');
const GmailService = require('../services/gmail');
const DriveService = require('../services/drive');
const LogService = require('../services/log');

// Dashboard verileri
router.get('/dashboard', async (req, res) => {
  try {
    const data = await StatsService.getDashboardData();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Tam tarama çalıştır
router.post('/run', async (req, res) => {
  try {
    await LogService.write('SİSTEM', 'BAŞLADI', '=== MYCOVITA OS TAM TARAMA ===');
    const gmailLogs = await GmailService.fetchOrders();
    const driveLogs = await DriveService.processInbox();
    await LogService.write('SİSTEM', 'BİTTİ', '=== TARAMA TAMAMLANDI ===');
    res.json({ success: true, logs: [...gmailLogs, ...driveLogs] });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Sadece Gmail tara
router.post('/gmail', async (req, res) => {
  try {
    const logs = await GmailService.fetchOrders();
    res.json({ success: true, logs });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Sadece Drive tara
router.post('/drive', async (req, res) => {
  try {
    const logs = await DriveService.processInbox();
    res.json({ success: true, logs });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0.0', timestamp: new Date().toISOString() });
});

module.exports = router;
