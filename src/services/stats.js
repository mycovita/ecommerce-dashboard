/**
 * 🍄 MYCOVITA OS v2.0 - STATS SERVICE
 * Dashboard istatistikleri
 */

const config = require('../config');
const WeatherService = require('./weather');
const CurrencyService = require('./currency');
const MarketplaceService = require('./marketplace');
const LogService = require('./log');

async function getDashboardData() {
  const ts = new Date().toLocaleString('tr-TR', { timeZone: config.timezone });

  const [weather, usdRate, marketplace, topProducts, recentLogs] = await Promise.all([
    WeatherService.getAllLocations(),
    CurrencyService.getUSDRate(),
    MarketplaceService.getMonthlyStats(),
    MarketplaceService.getTopProducts(5),
    LogService.getRecent(50)
  ]);

  return {
    timestamp: ts,
    system_status: 'ONLINE',
    weather,
    currency: { usd_try: usdRate },
    marketplace,
    top_products: topProducts,
    recent_logs: recentLogs,
    today: getTodayStats(recentLogs)
  };
}

function getTodayStats(logs) {
  const today = new Date().toLocaleDateString('tr-TR', { timeZone: config.timezone });
  let orders = 0, files = 0, errors = 0, mails = 0;

  for (const log of logs) {
    if (!log.timestamp?.toString().startsWith(today)) continue;
    if (log.status === 'YENİ' && log.fileName?.toString().startsWith('SİPARİŞ')) orders++;
    else if (log.status === 'BAŞARILI') files++;
    else if (log.status === 'HATA') errors++;
    if (log.detail?.toString().includes('Gmail')) mails++;
  }
  return { orders, files, errors, mails, date: today };
}

module.exports = { getDashboardData };
