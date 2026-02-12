/**
 * 🍄 MYCOVITA OS - LOG MODULE
 * Loglama işlemleri
 */

const LogModule = {
  write: function(fileName, status, detail) {
    let ts;
    try { ts = Utilities.formatDate(new Date(), "GMT+3", "dd-MM-yyyy HH:mm:ss"); } 
    catch(e) { ts = new Date().toISOString(); }
    const safeFileName = fileName || "UNKNOWN";
    const safeStatus = status || "INFO";
    const safeDetail = detail || "-";
    Logger.log(`[${ts}] [${safeStatus}] ${safeFileName} -> ${safeDetail}`);
    if (CONFIG.DASHBOARD_SHEET_ID) {
      try {
        const sheet = SpreadsheetApp.openById(CONFIG.DASHBOARD_SHEET_ID).getSheetByName("LOGS");
        if (sheet) {
          sheet.insertRowAfter(1);
          sheet.getRange(2, 1, 1, 4).setValues([[ts, safeFileName, safeStatus, safeDetail]]);
          const lastRow = sheet.getLastRow();
          if (lastRow > CONFIG.TERMINAL_MAX_LINES + 1) {
            sheet.deleteRows(CONFIG.TERMINAL_MAX_LINES + 2, lastRow - CONFIG.TERMINAL_MAX_LINES - 1);
          }
        }
      } catch(e) { Logger.log("⚠️ Sheet log hatası: " + e.toString()); }
    }
  },
  
  info: function(message) { this.write("SİSTEM", "INFO", message); },
  success: function(message) { this.write("SİSTEM", "BAŞARILI", message); },
  error: function(message) { this.write("SİSTEM", "HATA", message); },
  warning: function(message) { this.write("SİSTEM", "UYARI", message); },
  
  getRecent: function(count) {
    try {
      const sheet = SpreadsheetApp.openById(CONFIG.DASHBOARD_SHEET_ID).getSheetByName("LOGS");
      if (!sheet) return [];
      const lastRow = sheet.getLastRow();
      if (lastRow < 2) return [];
      const numRows = Math.min(count || CONFIG.TERMINAL_MAX_LINES, lastRow - 1);
      const data = sheet.getRange(2, 1, numRows, 4).getValues();
      return data.map(row => ({
        timestamp: row[0],
        fileName: row[1],
        status: row[2],
        detail: row[3]
      }));
    } catch(e) { return []; }
  }
};
