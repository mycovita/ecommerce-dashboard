/**
 * 🍄 MYCOVITA OS v2.0 - CURRENCY SERVICE
 * Döviz kuru işlemleri
 */

let _cache = { rate: null, timestamp: null };

async function getUSDRate() {
  const now = Date.now();
  if (_cache.rate && _cache.timestamp && (now - _cache.timestamp) < 600000) {
    return _cache.rate;
  }
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await res.json();
    if (data.rates?.TRY) {
      _cache = { rate: data.rates.TRY, timestamp: now };
      return _cache.rate;
    }
  } catch (e) { console.error('⚠️ Döviz kuru hatası:', e.message); }
  return _cache.rate || 35.0;
}

function convertToUSD(tryAmount) {
  const rate = _cache.rate || 35.0;
  return Math.round((tryAmount / rate) * 100) / 100;
}

module.exports = { getUSDRate, convertToUSD };
