/**
 * 🍄 MYCOVITA OS - STATS MODULE
 * Dashboard istatistikleri
 */

const StatsModule = {
  getDashboardData: function() {
    return {
      timestamp: Utilities.formatDate(new Date(), "GMT+3", "dd-MM-yyyy HH:mm:ss"),
      system_status: "ONLINE",
      weather: WeatherModule.getAllLocations(),
      currency: { usd_try: CurrencyModule.getUSDRate() },
      marketplace: MarketplaceModule.getMonthlyStats(),
      top_products: MarketplaceModule.getTopProducts(5),
      recent_logs: LogModule.getRecent(50),
      today: this.getTodayStats()
    };
  },
  
  getTodayStats: function() {
    try {
      const today = Utilities.formatDate(new Date(), "GMT+3", "dd-MM-yyyy");
      const logs = LogModule.getRecent(100);
      let orders = 0, files = 0, errors = 0, mails = 0;
      
      for (const log of logs) {
        if (!log.timestamp || !log.timestamp.toString().startsWith(today)) continue;
        if (log.status === "YENİ" && log.fileName && log.fileName.toString().startsWith("SİPARİŞ")) orders++;
        else if (log.status === "BAŞARILI") files++;
        else if (log.status === "HATA") errors++;
        if (log.detail && log.detail.toString().includes("Gmail")) mails++;
      }
      return { orders, files, errors, mails, date: today };
    } catch(e) { return { orders: 0, files: 0, errors: 0, mails: 0, date: '-' }; }
  }
};
