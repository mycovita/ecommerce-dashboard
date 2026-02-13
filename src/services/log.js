/**
 * 🍄 MYCOVITA OS v2.0 - LOG SERVICE
 * Loglama: Console + Google Sheets
 */

const config = require('../config');
const { getSheets } = require('../config/google-auth');

const LogService = {
  async write(fileName, status, detail) {
    const ts = new Date().toLocaleString('tr-TR', { timeZone: config.timezone });
    const safe = { 
      fileName: String(fileName || 'UNKNOWN').substring(0, 200), 
      status: String(status || 'INFO').substring(0, 50), 
      detail: String(detail || '-').substring(0, 500)
    };

    console.log(`[${ts}] [${safe.status}] ${safe.fileName} → ${safe.detail}`);

    try {
      const sheets = await getSheets();
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: config.dashboardSheetId,
        requestBody: {
          requests: [{
            insertDimension: {
              range: { sheetId: await this._getSheetId('LOGS'), dimension: 'ROWS', startIndex: 1, endIndex: 2 }
            }
          }]
        }
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId: config.dashboardSheetId,
        range: 'LOGS!A2:D2',
        valueInputOption: 'RAW',
        requestBody: { values: [[ts, safe.fileName, safe.status, safe.detail]] }
      });
    } catch (e) {
      console.error('⚠️ Sheet log hatası:', e.message);
    }
  },

  async _getSheetId(sheetName) {
    try {
      const sheets = await getSheets();
      const res = await sheets.spreadsheets.get({ spreadsheetId: config.dashboardSheetId });
      const sheet = res.data.sheets.find(s => s.properties.title === sheetName);
      return sheet ? sheet.properties.sheetId : 0;
    } catch { return 0; }
  },

  info(msg)    { return this.write('SİSTEM', 'INFO', msg); },
  success(msg) { return this.write('SİSTEM', 'BAŞARILI', msg); },
  error(msg)   { return this.write('SİSTEM', 'HATA', msg); },
  warning(msg) { return this.write('SİSTEM', 'UYARI', msg); },

  async getRecent(count = 50) {
    try {
      const sheets = await getSheets();
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: config.dashboardSheetId,
        range: `LOGS!A2:D${count + 1}`
      });
      const rows = res.data.values || [];
      return rows
        .filter(row => row && row.length >= 4)
        .map(row => ({
          timestamp: row[0], 
          fileName: row[1], 
          status: row[2], 
          detail: row[3]
        }));
    } catch { return []; }
  }
};

module.exports = LogService;
