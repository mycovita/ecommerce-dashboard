/**
 * 🍄 MYCOVITA OS v2.0 - AI SERVICE
 * Gemini AI entegrasyonu (Vertex AI)
 */

const config = require('../config');
const folderMap = require('../config/folders');
const { getAccessToken } = require('../config/google-auth');

const AIService = {
  _cachedPrompt: null,

  getEndpoint() {
    return `https://${config.gcpLocation}-aiplatform.googleapis.com/v1/projects/${config.gcpProjectId}/locations/${config.gcpLocation}/publishers/google/models/${config.geminiModel}:generateContent`;
  },

  buildPrompt() {
    if (this._cachedPrompt) return this._cachedPrompt;
    let cats = 'Allowed categories:\n';
    for (const [key, val] of Object.entries(folderMap)) {
      cats += `- ${key}: ${val.description}\n`;
    }
    this._cachedPrompt = `You are Myco-AI. Classify document into ONE category.\n${cats}\nReturn JSON only: { "document_type": "KEY", "summary": "TR summary", "suggested_filename": "KEY-DD-MM-YYYY-Desc" }`;
    return this._cachedPrompt;
  },

  // Dosya analizi (Drive'daki dosyalar için)
  async analyze(fileBase64, mimeType, fileName) {
    const token = await getAccessToken();
    const parts = [
      { text: this.buildPrompt() },
      { text: `Analyze. Filename: ${fileName}. Date format: DD-MM-YYYY.` }
    ];

    if (fileBase64) {
      parts.push({ inlineData: { mimeType: mimeType || 'application/pdf', data: fileBase64 } });
    }

    const payload = {
      contents: [{ role: 'user', parts }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 1024, responseMimeType: 'application/json' }
    };

    try {
      const res = await fetch(this.getEndpoint(), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) return null;
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return JSON.parse(text.replace(/```json/g, '').replace(/```/g, ''));
    } catch (e) { console.error('❌ AI Hatası:', e.message); }
    return null;
  },

  // Sipariş e-postası analizi
  async analyzeOrder(emailBody, skuList) {
    const token = await getAccessToken();
    const prompt = `Bu bir sipariş bildirim maili. Analiz et ve JSON olarak dön:
{
  "marketplace": "TRENDYOL" | "HEPSIBURADA" | "AMAZON_TR" | "MYCOVITA" | "OTHER",
  "order_id": "sipariş numarası",
  "total_amount": sayı (TL),
  "items": [{ "product_name": "ürün adı", "sku_code": "SKU veya null", "quantity": adet, "price": birim fiyat }]
}
SKU Listesi:\n${skuList}\n\nMail:\n${emailBody}`;

    const payload = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 2048, responseMimeType: 'application/json' }
    };

    try {
      const res = await fetch(this.getEndpoint(), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) return null;
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return JSON.parse(text.replace(/```json/g, '').replace(/```/g, ''));
    } catch (e) { console.error('❌ AI Order Hatası:', e.message); }
    return null;
  }
};

module.exports = AIService;
