/**
 * 🍄 MYCOVITA OS - DRIVE MODULE
 * Google Drive dosya işleme
 */

const DriveModule = {
  processInbox: function() {
    LogModule.info("Drive INBOX tarama başladı...");
    
    let logs = [], targetInbox, files;

    try {
      targetInbox = DriveApp.getFolderById(CONFIG.INBOX_ID);
      files = targetInbox.getFiles();
    } catch(e) {
      LogModule.error("INBOX klasörüne erişilemedi: " + e.toString());
      return ["❌ INBOX erişim hatası"];
    }

    let count = 0;
    while (files.hasNext() && count < CONFIG.BATCH_SIZE_DRIVE) {
      const file = files.next();
      const fileName = file.getName();
      
      try {
        LogModule.info("Dosya analiz ediliyor: " + fileName);
        logs.push("📄 " + fileName);

        // AI ile dosyayı analiz et
        const analysis = AIModule.analyze(file);

        if (analysis && analysis.document_type) {
          const docType = analysis.document_type;
          const folderInfo = FOLDER_MAP[docType] || FOLDER_MAP["UNKNOWN"];
          
          // Hedef klasöre taşı
          const targetFolder = DriveApp.getFolderById(folderInfo.folderId);
          
          // Dosya adını güncelle
          if (analysis.suggested_filename) {
            file.setName(analysis.suggested_filename);
          }
          
          // Taşı: hedef klasöre ekle, inbox'tan kaldır
          targetFolder.addFile(file);
          targetInbox.removeFile(file);
          
          LogModule.write(fileName, docType, analysis.summary || "Sınıflandırıldı");
          logs.push("  ✅ → " + docType + " (" + folderInfo.description + ")");
        } else {
          // AI analiz edemediyse UNKNOWN'a taşı
          const unknownFolder = DriveApp.getFolderById(FOLDER_MAP["UNKNOWN"].folderId);
          unknownFolder.addFile(file);
          targetInbox.removeFile(file);
          
          LogModule.warning("AI analiz edemedi, UNKNOWN'a taşındı: " + fileName);
          logs.push("  ⚠️ → UNKNOWN");
        }
        
        count++;
        Utilities.sleep(CONFIG.SLEEP_MS);
        
      } catch(e) {
        LogModule.error("Dosya işleme hatası (" + fileName + "): " + e.toString());
        logs.push("  ❌ Hata: " + e.toString());
      }
    }

    LogModule.info("Drive tarama tamamlandı: " + count + " dosya işlendi");
    logs.push("📂 Toplam: " + count + " dosya işlendi");
    return logs;
  }
};
