/**
 * 🍄 MYCOVITA OS - GMAIL MODULE
 * Gmail sipariş tarama
 */

const GmailModule = {
  fetchOrders: function() {
    LogModule.info("Gmail tarama başladı...");
    
    let label, processedLabel;
    try {
      label = GmailApp.getUserLabelByName(CONFIG.GMAIL_LABEL);
      processedLabel = GmailApp.getUserLabelByName(CONFIG.PROCESSED_LABEL);
      if (!processedLabel) {
        processedLabel = GmailApp.createLabel(CONFIG.PROCESSED_LABEL);
        LogModule.info("MYCO-ISLENDI etiketi oluşturuldu");
      }
    } catch(e) { 
      LogModule.error("Gmail etiket hatası: " + e.toString());
      return ["⚠️ Gmail erişilemedi"]; 
    }
    
    if (!label) {
      LogModule.warning("'" + CONFIG.GMAIL_LABEL + "' etiketi bulunamadı");
      return ["⚠️ '" + CONFIG.GMAIL_LABEL + "' etiketi yok."];
    }
    
    LogModule.info("SIPARISLER etiketi bulundu");
    
    let targetInbox;
    try { targetInbox = DriveApp.getFolderById(CONFIG.INBOX_ID); } 
    catch (e) { 
      LogModule.error("INBOX klasörü bulunamadı");
      return ["⚠️ INBOX klasörü bulunamadı"]; 
    }
    
    let threads;
    try { threads = label.getThreads(0, CONFIG.BATCH_SIZE_GMAIL); } 
    catch(e) { 
      LogModule.error("Mail listesi alınamadı");
      return ["⚠️ Mail listesi alınamadı"]; 
    }
    
    LogModule.info(`${threads.length} thread bulundu`);
    
    let fileCount = 0, orderCount = 0, processedThreads = 0;
    
    for (const thread of threads) {
      try {
        if (thread.getLabels().some(l => l.getName() === CONFIG.PROCESSED_LABEL)) {
          continue;
        }
        
        processedThreads++;
        const subject = thread.getFirstMessageSubject();
        LogModule.info(`Mail işleniyor: ${subject.substring(0, 50)}...`);
        
        for (const msg of thread.getMessages()) {
          const from = msg.getFrom();
          const msgSubject = msg.getSubject();
          
          LogModule.info(`Gönderen: ${from}`);
          
          const isOrderEmail = 
            from.toLowerCase().includes('siparis') ||
            from.toLowerCase().includes('order') ||
            from.toLowerCase().includes('trendyol') ||
            from.toLowerCase().includes('hepsiburada') ||
            from.toLowerCase().includes('amazon') ||
            msgSubject.toLowerCase().includes('sipariş') ||
            msgSubject.toLowerCase().includes('siparişiniz') ||
            msgSubject.toLowerCase().includes('order');
          
          if (isOrderEmail) {
            LogModule.info(`🛒 Sipariş maili tespit edildi: ${msgSubject}`);
            const orderResult = MarketplaceModule.processOrderEmail(msg);
            if (orderResult) {
              orderCount++;
              LogModule.success(`Sipariş işlendi: ${orderResult.order_id} - ${orderResult.marketplace}`);
            } else {
              LogModule.warning(`Sipariş parse edilemedi: ${msgSubject}`);
            }
          }
          
          const attachments = msg.getAttachments();
          if (attachments.length > 0) {
            LogModule.info(`${attachments.length} ek bulundu`);
          }
          
          for (const att of attachments) {
            if (att) { 
              const fileName = att.getName();
              targetInbox.createFile(att); 
              fileCount++;
              LogModule.success(`Ek kaydedildi: ${fileName}`);
            }
          }
        }
        
        thread.addLabel(processedLabel);
        LogModule.info(`Thread işlendi ve etiketlendi`);
        Utilities.sleep(CONFIG.SLEEP_MS);
        
      } catch(e) { 
        LogModule.error("Thread hatası: " + e.toString()); 
      }
    }
    
    const logs = [];
    if (orderCount > 0) logs.push(`✅ ${orderCount} sipariş işlendi`);
    if (fileCount > 0) logs.push(`✅ ${fileCount} dosya kaydedildi`);
    if (processedThreads === 0) logs.push("ℹ️ Yeni mail yok");
    
    LogModule.info(`Gmail tarama tamamlandı: ${orderCount} sipariş, ${fileCount} dosya`);
    
    return logs.length > 0 ? logs : ["ℹ️ Gmail: Yeni mail yok."];
  }
};
