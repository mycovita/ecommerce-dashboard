/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  🍄 MYCOVITA OS v2.0 - CONFIG                                 ║
 * ║  Tüm ayarlar .env'den gelir, hassas bilgi bu dosyada YOK     ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

require('dotenv').config();

const config = {
  // Google Cloud (env'den)
  gcpProjectId: process.env.GCP_PROJECT_ID,
  gcpLocation: process.env.GCP_LOCATION || 'us-central1',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash-001',

  // Google Drive (env'den)
  driveRootId: process.env.DRIVE_ROOT_ID,
  driveInboxId: process.env.DRIVE_INBOX_ID,

  // Google Sheets (env'den)
  dashboardSheetId: process.env.DASHBOARD_SHEET_ID,
  skuSheetId: process.env.SKU_SHEET_ID,

  // API Keys (env'den)
  openweatherApiKey: process.env.OPENWEATHER_API_KEY,

  // Gmail (env'den)
  gmailLabel: process.env.GMAIL_LABEL || 'SIPARISLER',
  gmailProcessedLabel: process.env.GMAIL_PROCESSED_LABEL || 'MYCO-ISLENDI',
  orderEmail: process.env.ORDER_EMAIL,

  // App ayarları (hassas değil, GitHub'da kalabilir)
  port: parseInt(process.env.PORT) || 8080,
  timezone: process.env.TZ || 'Europe/Istanbul',
  batchSizeGmail: 10,
  batchSizeDrive: 15,
  sleepMs: 200,
  maxFileSizeMb: 10,
  terminalMaxLines: 50,
  marketplaces: ['TRENDYOL', 'HEPSIBURADA', 'AMAZON_TR', 'MYCOVITA'],

  weatherLocations: [
    { name: 'Ordu', lat: 40.9839, lon: 37.8764 },
    { name: 'Ulubey', lat: 40.8667, lon: 37.7500 },
    { name: 'İstanbul', lat: 41.0082, lon: 28.9784 }
  ]
};

module.exports = config;
