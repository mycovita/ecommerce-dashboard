/**
 * 🍄 MYCOVITA OS - AI MODULE
 * Gemini AI entegrasyonu
 */

const AIModule = {
  _cachedPrompt: null,
  
  getEndpoint: function() {
    return `https://${CONFIG.LOCATION}-aiplatform.googleapis.com/v1/projects/${CONFIG.PROJECT_ID}/locations/${CONFIG.LOCATION}/publishers/google/models/${CONFIG.MODEL_ID}:generateContent`;
  },
  
  buildPrompt: function() {
    if (this._cachedPrompt) return this._cachedPrompt;
    let cats = "Allowed categories:\n";
    for (const [key, val] of Object.entries(FOLDER_MAP)) cats += `- ${key}: ${val.description}\n`;
    this._cachedPrompt = `You are Myco-AI. Classify document into ONE category.\n${cats}\nReturn JSON only: { "document_type": "KEY", "summary": "TR summary", "suggested_filename": "KEY-DD-MM-YYYY-Desc" }`;
    return this._cachedPrompt;
  },
  
  prepareContent: function(file) {
    if (!file) return null;
    let mimeType, fileSizeMB;
    try { mimeType = file.getMimeType(); fileSizeMB = file.getSize() / (1024 * 1024); } 
    catch (e) { return null; }
    
    let parts = [], blobData = null, activeMime = "application/pdf";
    
    try {
      if (mimeType === MimeType.GOOGLE_DOCS || mimeType === MimeType.GOOGLE_SHEETS) {
        blobData = FileModule.exportToPdfForAI(file.getId(), mimeType);
      } else if (mimeType === "application/pdf") {
        blobData = file.getBlob();
      } else if (mimeType.startsWith("image/")) {
        blobData = file.getBlob();
        activeMime = mimeType;
      } else if (fileSizeMB > CONFIG.MAX_FILE_SIZE_MB) {
        let thumb = null; try { thumb = file.getThumbnail(); } catch(e) {}
        if (thumb) { parts.push({ "text": "Preview. Filename: " + file.getName() }); parts.push({ "inlineData": { "mimeType": "image/png", "data": Utilities.base64Encode(thumb.getBytes()) }}); }
        else parts.push({ "text": "Filename: " + file.getName() });
      } else {
        let thumb = null; try { thumb = file.getThumbnail(); } catch(e) {}
        if (thumb) { parts.push({ "text": "Preview. Filename: " + file.getName() }); parts.push({ "inlineData": { "mimeType": "image/png", "data": Utilities.base64Encode(thumb.getBytes()) }}); }
        else parts.push({ "text": "Filename: " + file.getName() });
      }
      
      if (blobData && parts.length === 0) {
        parts.push({ "text": "Analyze. Date: DD-MM-YYYY." });
        parts.push({ "inlineData": { "mimeType": activeMime, "data": Utilities.base64Encode(blobData.getBytes()) }});
      }
    } catch (err) { return null; }
    
    return parts.length > 0 ? parts : null;
  },
  
  analyze: function(file) {
    if (!file) return null;
    const parts = this.prepareContent(file);
    if (!parts) return null;
    
    const payload = {
      "contents": [{ "role": "user", "parts": [{ "text": this.buildPrompt() }, ...parts] }],
      "generationConfig": { "temperature": 0.2, "maxOutputTokens": 1024, "responseMimeType": "application/json" }
    };
    
    try {
      const response = UrlFetchApp.fetch(this.getEndpoint(), {
        'method': 'post', 'contentType': 'application/json',
        'headers': { 'Authorization': 'Bearer ' + ScriptApp.getOAuthToken() },
        'payload': JSON.stringify(payload), 'muteHttpExceptions': true
      });
      if (response.getResponseCode() !== 200) return null;
      const result = JSON.parse(response.getContentText());
      if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
        let jsonText = result.candidates[0].content.parts[0].text.replace(/```json/g, "").replace(/```/g, "");
        return JSON.parse(jsonText);
      }
    } catch(e) { Logger.log("❌ AI Hatası: " + e.toString()); }
    return null;
  },
  
  analyzeOrder: function(emailBody, skuList) {
    const prompt = `Bu bir sipariş bildirim maili. Analiz et ve JSON olarak dön:
{
  "marketplace": "TRENDYOL" | "HEPSIBURADA" | "AMAZON_TR" | "MYCOVITA" | "OTHER",
  "order_id": "sipariş numarası",
  "total_amount": sayı (TL),
  "items": [{ "product_name": "ürün adı", "sku_code": "SKU veya null", "quantity": adet, "price": birim fiyat }]
}
SKU Listesi:\n${skuList}\n\nMail:\n${emailBody}`;

    const payload = {
      "contents": [{ "role": "user", "parts": [{ "text": prompt }] }],
      "generationConfig": { "temperature": 0.1, "maxOutputTokens": 2048, "responseMimeType": "application/json" }
    };
    
    try {
      const response = UrlFetchApp.fetch(this.getEndpoint(), {
        'method': 'post', 'contentType': 'application/json',
        'headers': { 'Authorization': 'Bearer ' + ScriptApp.getOAuthToken() },
        'payload': JSON.stringify(payload), 'muteHttpExceptions': true
      });
      if (response.getResponseCode() !== 200) return null;
      const result = JSON.parse(response.getContentText());
      if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
        let jsonText = result.candidates[0].content.parts[0].text.replace(/```json/g, "").replace(/```/g, "");
        return JSON.parse(jsonText);
      }
    } catch(e) { Logger.log("❌ AI Order Hatası: " + e.toString()); }
    return null;
  }
};
