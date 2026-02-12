/**
 * 🍄 MYCOVITA OS - FILE MODULE
 * Dosya işlemleri ve dönüşümler
 */

const FileModule = {
  toEnglishUpper: function(str) {
    if (!str) return "BILINMEYEN";
    const trMap = {'ç':'C','Ç':'C','ğ':'G','Ğ':'G','ı':'I','I':'I','i':'I','İ':'I','ö':'O','Ö':'O','ş':'S','Ş':'S','ü':'U','Ü':'U'};
    return str.split('').map(c => trMap[c] || c).join('').toUpperCase();
  },
  
  convertToGoogle: function(file) {
    const mimeType = file.getMimeType();
    const fileName = file.getName().replace(/\.[^/.]+$/, "");
    const parents = file.getParents();
    const parentFolder = parents.hasNext() ? parents.next() : DriveApp.getFolderById(CONFIG.INBOX_ID);
    
    try {
      if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || mimeType === "application/msword") {
        const blob = file.getBlob();
        const newFile = Drive.Files.create({ name: fileName, mimeType: MimeType.GOOGLE_DOCS, parents: [parentFolder.getId()] }, blob, { convert: true });
        file.setTrashed(true);
        return DriveApp.getFileById(newFile.id);
      }
      if (mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || mimeType === "application/vnd.ms-excel") {
        const blob = file.getBlob();
        const newFile = Drive.Files.create({ name: fileName, mimeType: MimeType.GOOGLE_SHEETS, parents: [parentFolder.getId()] }, blob, { convert: true });
        file.setTrashed(true);
        return DriveApp.getFileById(newFile.id);
      }
      return file;
    } catch (e) {
      Logger.log("❌ Google dönüştürme hatası: " + e.toString());
      return file;
    }
  },
  
  exportToPdfForAI: function(fileId, mimeType) {
    if (!fileId) return null;
    try {
      let exportUrl;
      if (mimeType === MimeType.GOOGLE_SHEETS) exportUrl = `https://docs.google.com/spreadsheets/d/${fileId}/export?format=pdf`;
      else if (mimeType === MimeType.GOOGLE_DOCS) exportUrl = `https://docs.google.com/document/d/${fileId}/export?format=pdf`;
      else return null;
      const response = UrlFetchApp.fetch(exportUrl, { headers: { 'Authorization': 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true });
      if (response.getResponseCode() === 200) return response.getBlob();
    } catch (e) { Logger.log("❌ PDF Export hatası: " + e.toString()); }
    return null;
  },
  
  getExtension: function(file) {
    if (!file) return "";
    try {
      const mime = file.getMimeType();
      if (mime === MimeType.GOOGLE_SHEETS || mime === MimeType.GOOGLE_DOCS) return "";
      const name = file.getName();
      if (name && name.includes(".")) return name.substring(name.lastIndexOf("."));
    } catch(e) {}
    return "";
  },
  
  processAndMove: function(file, analysis) {
    if (!file || !analysis) return "HATA";
    const docType = analysis.document_type || "UNKNOWN";
    const catInfo = FOLDER_MAP[docType] || FOLDER_MAP["UNKNOWN"];
    
    let destFolder;
    try { destFolder = DriveApp.getFolderById(catInfo.folderId); } 
    catch (e) { destFolder = DriveApp.getFolderById(CONFIG.ROOT_ID); }
    
    let rawName = analysis.suggested_filename || "MYCO_BILINMEYEN";
    if (!/\d{2}-\d{2}-\d{4}/.test(rawName)) {
      const today = Utilities.formatDate(new Date(), "GMT+3", "dd-MM-yyyy");
      rawName = `${docType}-${today}-BILINMEYEN`;
    }
    
    let safeName = this.toEnglishUpper(rawName).replace(/[\\/:*?"<>|]/g, '_').substring(0, 200).replace(/\.[^.]+$/, '');
    let finalExt = this.getExtension(file);
    let finalFullName = safeName + finalExt;
    
    try { if (destFolder.getFilesByName(finalFullName).hasNext()) finalFullName = safeName + "_KOPYA_" + Utilities.getUuid().slice(0, 8) + finalExt; } catch(e) {}
    
    try {
      file.moveTo(destFolder);
      file.setName(finalFullName);
      file.setDescription(`🤖 MYCO-AI v27.0\n📂 ${docType}\n📝 ${analysis.summary || 'Özet yok'}`);
    } catch(e) { return `HATA: ${e.toString()}`; }
    
    LogModule.write(finalFullName, "BAŞARILI", destFolder.getName());
    return `${finalFullName} -> ${destFolder.getName()}`;
  }
};
