/**
 * 🍄 MYCOVITA OS v2.0 - AI SERVICE
 * Gemini AI entegrasyonu (Vertex AI)
 * Akıllı dosya sınıflandırma + sipariş analizi
 */

const config = require('../config');
const folderMap = require('../config/folders');
const { getAccessToken } = require('../config/google-auth');

// Dosya uzantısına göre ön-sınıflandırma ipuçları
const MIME_HINTS = {
  'video/mp4': 'Bu bir VIDEO dosyası. Genellikle reklam, tanıtım veya sosyal medya içeriğidir.',
  'video/quicktime': 'Bu bir VIDEO dosyası. Genellikle reklam, tanıtım veya sosyal medya içeriğidir.',
  'video/x-msvideo': 'Bu bir VIDEO dosyası. Genellikle reklam, tanıtım veya sosyal medya içeriğidir.',
  'image/jpeg': 'Bu bir GÖRSEL dosya. Ürün fotoğrafı, pazarlama görseli veya belge taraması olabilir.',
  'image/png': 'Bu bir GÖRSEL dosya. Ürün fotoğrafı, pazarlama görseli, logo veya tasarım olabilir.',
  'application/pdf': 'Bu bir PDF belgesi. Fatura, sözleşme, rapor, sertifika veya resmi belge olabilir.',
  'application/vnd.google-apps.spreadsheet': 'Bu bir TABLO dosyası. Stok takibi, sipariş listesi veya mali tablo olabilir.',
  'application/vnd.google-apps.document': 'Bu bir DOKÜMAN. Rapor, sözleşme, talimatname veya yazışma olabilir.',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Bu bir WORD belgesi.',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Bu bir EXCEL dosyası.',
  'application/zip': 'Bu bir ARŞİV dosyası. Kod, yedek veya toplu veri içerebilir.'
};

const AIService = {
  _cachedPrompt: null,

  getEndpoint() {
    return `https://${config.gcpLocation}-aiplatform.googleapis.com/v1/projects/${config.gcpProjectId}/locations/${config.gcpLocation}/publishers/google/models/${config.geminiModel}:generateContent`;
  },

  buildPrompt() {
    if (this._cachedPrompt) return this._cachedPrompt;

    let cats = '';
    for (const [key, val] of Object.entries(folderMap)) {
      cats += `- ${key}: ${val.description}\n`;
    }

    this._cachedPrompt = `Sen Myco-AI'sın. MYCOVITA şirketi için dosya sınıflandırma yapıyorsun.

ŞİRKET BAĞLAMI:
- Mycovita, Türkiye'de mantar yetiştiriciliği ve mantar bazlı ürünler (takviye gıda, smoothie, çay vb.) üreten bir şirkettir.
- Ordu/Ulubey'de üretim tesisleri vardır (Unit A, B, C, D).
- Trendyol, Hepsiburada, Amazon TR ve kendi web sitesinde satış yapar.
- IoT sensörlerle üretim ortamını izler.
- Laboratuvar testleri ve kalite kontrol süreçleri vardır.

SINIFLANDIRMA KURALLARI:
1. Dosya adını, içeriğini ve MIME tipini birlikte analiz et.
2. Video dosyaları (mp4, mov, avi):
   - Reklam/tanıtım/ürün videosu → SOCIAL_MEDIA
   - Eğitim/talimat videosu → PRODUCTION_BATCH
3. Görsel dosyalar (jpg, png):
   - Ürün fotoğrafı, pazarlama görseli → MARKETING_ASSET
   - Logo, marka kimliği → BRANDING
   - Sosyal medya paylaşımı → SOCIAL_MEDIA
4. PDF/Dokümanlar: İçeriğe göre sınıflandır.
5. "Mycovita", "mantar", "mushroom" içeren dosyalar genellikle şirketin kendi ürün/pazarlama materyalidir.
6. Dosya adındaki ipuçları: "fatura"→INVOICE, "sözleşme"→CONTRACT, "rapor"→LAB_REPORT, "reklam/film/slogan"→SOCIAL_MEDIA
7. Emin olamadığında en yakın kategoriyi seç, UNKNOWN'u sadece gerçekten hiçbir kategoriye uymazsa kullan.

KATEGORİLER:
${cats}

JSON formatında yanıt ver (başka hiçbir şey yazma):
{
  "document_type": "KATEGORI_KEY",
  "summary": "Dosyanın kısa Türkçe açıklaması",
  "suggested_filename": "KATEGORI-GG-AA-YYYY-Kısa_Açıklama"
}`;

    return this._cachedPrompt;
  },

  // Dosya analizi
  async analyze(fileBase64, mimeType, fileName) {
    const token = await getAccessToken();
    const mimeHint = MIME_HINTS[mimeType] || '';
    const today = new Date().toLocaleDateString('tr-TR', { timeZone: config.timezone, day: '2-digit', month: '2-digit', year: 'numeric' }).split('.').join('-');

    const parts = [
      { text: this.buildPrompt() },
      { text: `Dosya bilgileri:
- Dosya adı: ${fileName}
- MIME tipi: ${mimeType || 'bilinmiyor'}
- İpucu: ${mimeHint}
- Bugünün tarihi: ${today}

Bu dosyayı sınıflandır. Dosya adından ve tipinden en uygun kategoriyi belirle.` }
    ];

    // Sadece doküman/PDF ise içeriği gönder (video/resim için dosya adı yeterli)
    const isDocument = mimeType && (
      mimeType.includes('pdf') || 
      mimeType.includes('document') || 
      mimeType.includes('spreadsheet') ||
      mimeType.includes('text')
    );

    if (fileBase64 && isDocument) {
      parts.push({ inlineData: { mimeType: mimeType, data: fileBase64 } });
    }

    const payload = {
      contents: [{ role: 'user', parts }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 1024, responseMimeType: 'application/json' }
    };

    try {
      const res = await fetch(this.getEndpoint(), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        console.error('AI API Hata:', res.status, await res.text());
        return null;
      }
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
