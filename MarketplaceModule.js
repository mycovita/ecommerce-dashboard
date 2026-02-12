/**
 * 🍄 MYCOVITA OS - MARKETPLACE MODULE
 * Pazar yeri sipariş yönetimi
 */

const MarketplaceModule = {
  
  MARKETPLACE_KEYWORDS: {
    'TRENDYOL': ['trendyol', 'ty-', 'trendyol.com'],
    'HEPSIBURADA': ['hepsiburada', 'hb-', 'hepsiburada.com'],
    'AMAZON_TR': ['amazon', 'amzn', 'amazon.com.tr'],
    'MYCOVITA': ['mycovita', 'mycovita.com']
  },
  
  detectMarketplace: function(text) {
    const lowerText = text.toLowerCase();
    for (const [marketplace, keywords] of Object.entries(this.MARKETPLACE_KEYWORDS)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          return marketplace;
        }
      }
    }
    return 'OTHER';
  },
  
  processOrderEmail: function(message) {
    try {
      const body = message.getPlainBody() || message.getBody();
      const subject = message.getSubject();
      const from = message.getFrom();
      
      LogModule.info(`Sipariş analiz ediliyor: ${subject}`);
      
      const detectedMarketplace = this.detectMarketplace(from + ' ' + subject + ' ' + body);
      LogModule.info(`Tespit edilen pazar yeri: ${detectedMarketplace}`);
      
      const skuText = SKUModule.getAsText();
      
      LogModule.info("AI analizi başlatılıyor...");
      const analysis = AIModule.analyzeOrder(body, skuText);
      
      if (!analysis) {
        LogModule.warning("AI analiz başarısız, basit kayıt yapılıyor");
        const simpleOrder = {
          marketplace: detectedMarketplace,
          order_id: this.extractOrderId(body, subject) || 'UNKNOWN-' + Date.now(),
          total_amount: this.extractAmount(body) || 0,
          items: []
        };
        this.saveOrder(simpleOrder);
        LogModule.write(`SİPARİŞ: ${simpleOrder.order_id}`, "YENİ", `${simpleOrder.marketplace} - ₺${simpleOrder.total_amount}`);
        return simpleOrder;
      }
      
      if (!analysis.marketplace || analysis.marketplace === 'OTHER') {
        analysis.marketplace = detectedMarketplace;
      }
      
      this.saveOrder(analysis);
      LogModule.write(`SİPARİŞ: ${analysis.order_id}`, "YENİ", `${analysis.marketplace} - ₺${analysis.total_amount}`);
      
      return analysis;
    } catch(e) { 
      LogModule.error("Order email hatası: " + e.toString());
      return null; 
    }
  },
  
  extractOrderId: function(body, subject) {
    const patterns = [
      /sipari[şs]\s*(?:no|numaras[ıi]|#)?[:\s]*([A-Z0-9\-]+)/i,
      /order\s*(?:id|no|#)?[:\s]*([A-Z0-9\-]+)/i,
      /([A-Z]{2,3}[\-_]?\d{6,})/i,
      /#(\d{6,})/
    ];
    
    const fullText = subject + ' ' + body;
    for (const pattern of patterns) {
      const match = fullText.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return null;
  },
  
  extractAmount: function(body) {
    const patterns = [
      /toplam[:\s]*([0-9.,]+)\s*(?:tl|₺)/i,
      /tutar[:\s]*([0-9.,]+)\s*(?:tl|₺)/i,
      /total[:\s]*([0-9.,]+)\s*(?:tl|₺)/i,
      /₺\s*([0-9.,]+)/,
      /([0-9.,]+)\s*TL/i
    ];
    
    for (const pattern of patterns) {
      const match = body.match(pattern);
      if (match && match[1]) {
        const amount = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
        if (!isNaN(amount) && amount > 0) {
          return amount;
        }
      }
    }
    return 0;
  },
  
  saveOrder: function(order) {
    try {
      LogModule.info(`Sipariş kaydediliyor: ${order.order_id}`);
      
      const ss = SpreadsheetApp.openById(CONFIG.DASHBOARD_SHEET_ID);
      let sheet = ss.getSheetByName("ORDERS");
      if (!sheet) {
        sheet = ss.insertSheet("ORDERS");
        sheet.getRange("A1:G1").setValues([["TARİH", "MARKETPLACE", "ORDER_ID", "TUTAR_TL", "TUTAR_USD", "URUN_SAYISI", "DETAY"]]);
        sheet.getRange("A1:G1").setFontWeight("bold").setBackground("#4c4c4c").setFontColor("white");
        sheet.setFrozenRows(1);
        LogModule.info("ORDERS sayfası oluşturuldu");
      }
      
      const ts = Utilities.formatDate(new Date(), "GMT+3", "dd-MM-yyyy HH:mm");
      const usdAmount = CurrencyModule.convertToUSD(order.total_amount || 0);
      const itemCount = order.items ? order.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;
      const detail = order.items && order.items.length > 0 
        ? order.items.map(i => `${i.product_name} x${i.quantity}`).join(', ') 
        : 'Ürün detayı yok';
      
      sheet.insertRowAfter(1);
      sheet.getRange(2, 1, 1, 7).setValues([[
        ts, 
        order.marketplace || 'OTHER', 
        order.order_id || '-', 
        order.total_amount || 0, 
        usdAmount, 
        itemCount, 
        detail
      ]]);
      
      LogModule.success(`Sipariş kaydedildi: ${order.marketplace} - ${order.order_id} - ₺${order.total_amount}`);
      
      if (order.items && order.items.length > 0) {
        for (const item of order.items) { 
          this.updateProductSales(item); 
        }
      }
    } catch(e) { 
      LogModule.error("Sipariş kaydetme hatası: " + e.toString()); 
    }
  },
  
  updateProductSales: function(item) {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.DASHBOARD_SHEET_ID);
      let sheet = ss.getSheetByName("PRODUCT_SALES");
      if (!sheet) {
        sheet = ss.insertSheet("PRODUCT_SALES");
        sheet.getRange("A1:E1").setValues([["AY", "SKU_CODE", "URUN_ADI", "ADET", "CIRO"]]);
        sheet.getRange("A1:E1").setFontWeight("bold").setBackground("#4c4c4c").setFontColor("white");
        sheet.setFrozenRows(1);
      }
      
      const currentMonth = Utilities.formatDate(new Date(), "GMT+3", "yyyy-MM");
      const skuMatch = SKUModule.findMatch(item.product_name);
      const skuCode = item.sku_code || (skuMatch ? skuMatch.sku_code : 'UNKNOWN');
      const productName = skuMatch ? skuMatch.product_name : item.product_name;
      
      const data = sheet.getDataRange().getValues();
      let foundRow = -1;
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === currentMonth && data[i][1] === skuCode) { foundRow = i + 1; break; }
      }
      
      const quantity = item.quantity || 1;
      const price = item.price || 0;
      const revenue = quantity * price;
      
      if (foundRow > 0) {
        const currentQty = sheet.getRange(foundRow, 4).getValue() || 0;
        const currentRev = sheet.getRange(foundRow, 5).getValue() || 0;
        sheet.getRange(foundRow, 4).setValue(currentQty + quantity);
        sheet.getRange(foundRow, 5).setValue(currentRev + revenue);
      } else {
        sheet.appendRow([currentMonth, skuCode, productName, quantity, revenue]);
      }
      
      LogModule.info(`Ürün satışı güncellendi: ${productName} x${quantity}`);
    } catch(e) { 
      LogModule.warning("Ürün satış güncelleme hatası: " + e.toString()); 
    }
  },
  
  getMonthlyStats: function() {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.DASHBOARD_SHEET_ID);
      const sheet = ss.getSheetByName("ORDERS");
      if (!sheet) return { marketplaces: {}, total: { orders: 0, revenue_tl: 0, revenue_usd: 0 } };
      
      const currentMonth = Utilities.formatDate(new Date(), "GMT+3", "MM-yyyy");
      const data = sheet.getDataRange().getValues();
      
      const stats = { marketplaces: {}, total: { orders: 0, revenue_tl: 0, revenue_usd: 0 } };
      for (const mp of CONFIG.MARKETPLACES) { stats.marketplaces[mp] = { orders: 0, revenue_tl: 0, revenue_usd: 0 }; }
      
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const dateStr = row[0];
        if (!dateStr) continue;
        const rowMonth = dateStr.toString().split(' ')[0].substring(3);
        if (rowMonth !== currentMonth) continue;
        
        const marketplace = row[1] || 'OTHER';
        const amountTL = parseFloat(row[3]) || 0;
        const amountUSD = parseFloat(row[4]) || 0;
        
        if (!stats.marketplaces[marketplace]) { stats.marketplaces[marketplace] = { orders: 0, revenue_tl: 0, revenue_usd: 0 }; }
        stats.marketplaces[marketplace].orders++;
        stats.marketplaces[marketplace].revenue_tl += amountTL;
        stats.marketplaces[marketplace].revenue_usd += amountUSD;
        stats.total.orders++;
        stats.total.revenue_tl += amountTL;
        stats.total.revenue_usd += amountUSD;
      }
      return stats;
    } catch(e) { return { marketplaces: {}, total: { orders: 0, revenue_tl: 0, revenue_usd: 0 } }; }
  },
  
  getTopProducts: function(limit) {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.DASHBOARD_SHEET_ID);
      const sheet = ss.getSheetByName("PRODUCT_SALES");
      if (!sheet) return [];
      
      const currentMonth = Utilities.formatDate(new Date(), "GMT+3", "yyyy-MM");
      const data = sheet.getDataRange().getValues();
      const products = [];
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === currentMonth) {
          products.push({ sku_code: data[i][1], product_name: data[i][2], quantity: data[i][3] || 0, revenue: data[i][4] || 0 });
        }
      }
      products.sort((a, b) => b.quantity - a.quantity);
      return products.slice(0, limit || 5);
    } catch(e) { return []; }
  }
};
