/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  🍄 MYCOVITA OS - MAIN                                        ║
 * ║  Ana giriş noktası ve Web App                                 ║
 * ║  Versiyon: 27.0                                               ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════
// WEB APP
// ═══════════════════════════════════════════════════════════════
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Dashboard')
    .setTitle('🍄 MYCOVITA OS')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getDashboardDataForWeb() {
  return StatsModule.getDashboardData();
}

function runActionForWeb(action) {
  if (action === 'run') return { success: true, logs: processEverything() };
  if (action === 'gmail') return { success: true, logs: GmailModule.fetchOrders() };
  if (action === 'drive') return { success: true, logs: DriveModule.processInbox() };
  return { success: false, logs: ['Bilinmeyen aksiyon'] };
}

// ═══════════════════════════════════════════════════════════════
// MAIN FUNCTIONS
// ═══════════════════════════════════════════════════════════════
function processEverything() {
  let logs = [];
  
  LogModule.write("SİSTEM", "BAŞLADI", "=== MYCOVITA OS TAM TARAMA ===");
  
  LogModule.info("━━━ GMAIL TARAMA BAŞLADI ━━━");
  logs.push("📧 Gmail taranıyor...");
  const gmailLogs = GmailModule.fetchOrders();
  logs = logs.concat(gmailLogs);
  
  Utilities.sleep(CONFIG.SLEEP_MS);
  
  LogModule.info("━━━ DRIVE TARAMA BAŞLADI ━━━");
  logs.push("📂 Drive taranıyor...");
  const driveLogs = DriveModule.processInbox();
  logs = logs.concat(driveLogs);
  
  LogModule.write("SİSTEM", "BİTTİ", `=== TARAMA TAMAMLANDI: ${logs.length} işlem ===`);
  
  return logs;
}

// ═══════════════════════════════════════════════════════════════
// SETUP & TEST
// ═══════════════════════════════════════════════════════════════
function SETUP_DASHBOARD() {
  const ss = SpreadsheetApp.openById(CONFIG.DASHBOARD_SHEET_ID);
  
  let logSheet = ss.getSheetByName("LOGS");
  if (!logSheet) logSheet = ss.insertSheet("LOGS");
  logSheet.clear();
  logSheet.getRange("A1:D1").setValues([["ZAMAN", "DOSYA ADI", "DURUM", "DETAY"]]);
  logSheet.getRange("A1:D1").setFontWeight("bold").setBackground("#4c4c4c").setFontColor("white");
  logSheet.setFrozenRows(1);

  let orderSheet = ss.getSheetByName("ORDERS");
  if (!orderSheet) orderSheet = ss.insertSheet("ORDERS");
  orderSheet.clear();
  orderSheet.getRange("A1:G1").setValues([["TARİH", "MARKETPLACE", "ORDER_ID", "TUTAR_TL", "TUTAR_USD", "URUN_SAYISI", "DETAY"]]);
  orderSheet.getRange("A1:G1").setFontWeight("bold").setBackground("#22c55e").setFontColor("white");
  orderSheet.setFrozenRows(1);

  let productSheet = ss.getSheetByName("PRODUCT_SALES");
  if (!productSheet) productSheet = ss.insertSheet("PRODUCT_SALES");
  productSheet.clear();
  productSheet.getRange("A1:E1").setValues([["AY", "SKU_CODE", "URUN_ADI", "ADET", "CIRO"]]);
  productSheet.getRange("A1:E1").setFontWeight("bold").setBackground("#f97316").setFontColor("white");
  productSheet.setFrozenRows(1);

  Logger.log("✅ Dashboard setup tamamlandı!");
}

function testDashboard() { 
  Logger.log(JSON.stringify(StatsModule.getDashboardData(), null, 2)); 
}




// ... mevcut kodların sonu ...

function testFullFlow() {
  Logger.log("=== TAM TEST ===");
  const data = getDashboardDataForWeb();
  Logger.log("Weather: " + JSON.stringify(data.weather ? data.weather.length : "YOK"));
  if (data.weather && data.weather[0]) {
    Logger.log("Örnek: " + data.weather[0].location + " - " + data.weather[0].current.temp + "°C");
  }
  Logger.log("=== BİTTİ ===");
}
