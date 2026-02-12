/**
 * 🍄 MYCOVITA OS - CURRENCY MODULE
 * Döviz kuru işlemleri
 */

const CurrencyModule = {
  _cache: { rate: null, timestamp: null },
  
  getUSDRate: function() {
    const now = new Date().getTime();
    if (this._cache.rate && this._cache.timestamp && (now - this._cache.timestamp) < 600000) {
      return this._cache.rate;
    }
    try {
      const apiResponse = UrlFetchApp.fetch('https://api.exchangerate-api.com/v4/latest/USD', { muteHttpExceptions: true });
      const data = JSON.parse(apiResponse.getContentText());
      if (data.rates && data.rates.TRY) {
        this._cache.rate = data.rates.TRY;
        this._cache.timestamp = now;
        return this._cache.rate;
      }
    } catch(e) { Logger.log("⚠️ Döviz kuru hatası: " + e.toString()); }
    return this._cache.rate || 35.0;
  },
  
  convertToUSD: function(tryAmount) {
    const rate = this.getUSDRate();
    return Math.round((tryAmount / rate) * 100) / 100;
  }
};
