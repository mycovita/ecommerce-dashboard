/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  🍄 MYCOVITA OS - CONFIG                                      ║
 * ║  Tüm ayarlar ve sabitler                                      ║
 * ║  ⚠️ Hassas bilgiler Secrets.js'den gelir                      ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

const CONFIG = {
  // === Secrets'ten gelen değerler ===
  PROJECT_ID: SECRETS.PROJECT_ID,
  LOCATION: 'us-central1',
  MODEL_ID: 'gemini-2.0-flash-001',
  ROOT_ID: SECRETS.ROOT_ID,
  INBOX_ID: SECRETS.INBOX_ID,
  GMAIL_LABEL: 'SIPARISLER',
  PROCESSED_LABEL: 'MYCO-ISLENDI',
  ORDER_EMAIL: SECRETS.ORDER_EMAIL,
  DASHBOARD_SHEET_ID: SECRETS.DASHBOARD_SHEET_ID,
  SKU_SHEET_ID: SECRETS.SKU_SHEET_ID,
  OPENWEATHER_API_KEY: SECRETS.OPENWEATHER_API_KEY,
  
  // === Hassas olmayan ayarlar (GitHub'da kalabilir) ===
  WEATHER_LOCATIONS: [
    { name: 'Ordu', lat: 40.9839, lon: 37.8764 },
    { name: 'Ulubey', lat: 40.8667, lon: 37.7500 },
    { name: 'İstanbul', lat: 41.0082, lon: 28.9784 }
  ],
  MARKETPLACES: ['TRENDYOL', 'HEPSIBURADA', 'AMAZON_TR', 'MYCOVITA'],
  BATCH_SIZE_GMAIL: 10,
  BATCH_SIZE_DRIVE: 15,
  SLEEP_MS: 200,
  MAX_FILE_SIZE_MB: 10,
  TERMINAL_MAX_LINES: 50
};

// FOLDER_MAP artık Secrets'ten geliyor
const FOLDER_MAP = SECRETS.FOLDER_MAP;
