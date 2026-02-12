
Editor
appsscript.json
Config.gs
Dashboard.html
LogModule.gs
FileModule.gs
AIModule.gs
SKUModule.gs
CurrencyModule.gs
WeatherModule.gs
MarketplaceModule.gs
StatsModule.gs
GmailModule.gs
DriveModule.gs
Code.gs.gs
Drive
Gmail
No functions
.

1234567891011121314151617181920212223242526272829303132333435363738394041424344
/**
 * 🍄 MYCOVITA OS - DRIVE MODULE
 * Google Drive dosya işleme
 */

const DriveModule = {
  processInbox: function() {
    LogModule.info("Drive INBOX tarama başladı...");
    
    let logs = [], targetInbox, files;

