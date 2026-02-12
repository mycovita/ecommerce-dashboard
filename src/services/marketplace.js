/**
 * 🍄 MYCOVITA OS v2.0 - MARKETPLACE SERVICE
 * Pazar yeri sipariş yönetimi
 */

const config = require('../config');
const { getSheets } = require('../config/google-auth');
const AIService = require('./ai');
const SKUService = require('./sku');
const CurrencyService = require('./currency');
const LogService = require('./log');

const MARKETPLACE_KEYWORDS = {
  TRENDYOL: ['trendyol', 'ty-', 'trendyol.com'],
  HEPSIBURADA: ['hepsiburada', 'hb-', 'hepsiburada.com'],
  AMAZON_TR: ['amazon', 'amzn', 'amazon.com.tr'],
  MYCOVITA: ['mycovita', 'mycovita.com']
};

function detectMarketplace(text) {
  const lower = text.toLowerCase();
  for (const [mp, keywords] of Object.entries(MARKETPLACE_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return mp;
    }
  }
  return 'OTHER';
}

function extractOrderId(body, subject) {
  const patterns = [
    /sipari[şs]\s*(?:no|numaras[ıi]|#)?[:\s]*([A-Z0-9\-]+)/i,
    /order\s*(?:id|no|#)?[:\s]*([A-Z0-9\-]+)/i,
    /([A-Z]{2,3}[\-_]?\d{6,})/i,
    /#(\d{6,})/
  ];
  const fullText = subject + ' ' + body;
  for (const p of patterns) {
    const m = fullText.match(p);
    if (m?.[1]) return m[1].trim();
  }
  return null;
}

function extractAmount(body) {
  const patterns = [
    /toplam[:\s]*([0-9.,]+)\s*(?:tl|₺)/i,
    /tutar[:\s]*([0-9.,]+)\s*(?:tl|₺)/i,
    /total[:\s]*([0-9.,]+)\s*(?:tl|₺)/i,
    /₺\s*([0-9.,]+)/,
    /([0-9.,]+)\s*TL/i
  ];
  for (const p of patterns) {
    const m = body.match(p);
    if (m?.[1]) {
      const amount = parseFloat(m[1].replace(/\./g, '').replace(',', '.'));
      if (!isNaN(amount) && amount > 0) return amount;
    }
  }
  return 0;
}

async function processOrderEmail(from, subject, body) {
  try {
    await LogService.info(`Sipariş analiz ediliyor: ${subject}`);
    const detected = detectMarketplace(from + ' ' + subject + ' ' + body);
    const skuText = await SKUService.getAsText();
    const analysis = await AIService.analyzeOrder(body, skuText);

    let order;
    if (!analysis) {
      order = {
        marketplace: detected,
        order_id: extractOrderId(body, subject) || 'UNKNOWN-' + Date.now(),
        total_amount: extractAmount(body) || 0,
        items: []
      };
    } else {
      order = analysis;
      if (!order.marketplace || order.marketplace === 'OTHER') order.marketplace = detected;
    }

    await saveOrder(order);
    await LogService.write(`SİPARİŞ: ${order.order_id}`, 'YENİ', `${order.marketplace} - ₺${order.total_amount}`);
    return order;
  } catch (e) {
    await LogService.error('Order email hatası: ' + e.message);
    return null;
  }
}

async function saveOrder(order) {
  try {
    const sheets = await getSheets();
    const ts = new Date().toLocaleString('tr-TR', { timeZone: config.timezone });
    const usdAmount = CurrencyService.convertToUSD(order.total_amount || 0);
    const itemCount = order.items ? order.items.reduce((sum, i) => sum + (i.quantity || 1), 0) : 0;
    const detail = order.items?.length > 0
      ? order.items.map(i => `${i.product_name} x${i.quantity}`).join(', ')
      : 'Ürün detayı yok';

    // ORDERS sayfasına ekle
    await sheets.spreadsheets.values.append({
      spreadsheetId: config.dashboardSheetId,
      range: 'ORDERS!A:G',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [[ts, order.marketplace || 'OTHER', order.order_id || '-', order.total_amount || 0, usdAmount, itemCount, detail]]
      }
    });

    // Ürün satışlarını güncelle
    if (order.items?.length > 0) {
      for (const item of order.items) await updateProductSales(item);
    }
  } catch (e) {
    await LogService.error('Sipariş kaydetme hatası: ' + e.message);
  }
}

async function updateProductSales(item) {
  try {
    const sheets = await getSheets();
    const currentMonth = new Date().toLocaleDateString('tr-TR', { timeZone: config.timezone, year: 'numeric', month: '2-digit' }).split('.').reverse().join('-');
    const skuMatch = await SKUService.findMatch(item.product_name);
    const skuCode = item.sku_code || (skuMatch ? skuMatch.sku_code : 'UNKNOWN');
    const productName = skuMatch ? skuMatch.product_name : item.product_name;
    const quantity = item.quantity || 1;
    const revenue = quantity * (item.price || 0);

    await sheets.spreadsheets.values.append({
      spreadsheetId: config.dashboardSheetId,
      range: 'PRODUCT_SALES!A:E',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [[currentMonth, skuCode, productName, quantity, revenue]] }
    });
  } catch (e) {
    console.error('Ürün satış güncelleme hatası:', e.message);
  }
}

async function getMonthlyStats() {
  try {
    const sheets = await getSheets();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: config.dashboardSheetId,
      range: 'ORDERS!A:G'
    });
    const rows = res.data.values || [];
    const now = new Date();
    const currentMonth = `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;

    const stats = { marketplaces: {}, total: { orders: 0, revenue_tl: 0, revenue_usd: 0 } };
    for (const mp of config.marketplaces) stats.marketplaces[mp] = { orders: 0, revenue_tl: 0, revenue_usd: 0 };

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[0]) continue;
      const rowMonth = row[0].toString().split(' ')[0]?.substring(3);
      if (rowMonth !== currentMonth) continue;

      const mp = row[1] || 'OTHER';
      const tl = parseFloat(row[3]) || 0;
      const usd = parseFloat(row[4]) || 0;

      if (!stats.marketplaces[mp]) stats.marketplaces[mp] = { orders: 0, revenue_tl: 0, revenue_usd: 0 };
      stats.marketplaces[mp].orders++;
      stats.marketplaces[mp].revenue_tl += tl;
      stats.marketplaces[mp].revenue_usd += usd;
      stats.total.orders++;
      stats.total.revenue_tl += tl;
      stats.total.revenue_usd += usd;
    }
    return stats;
  } catch { return { marketplaces: {}, total: { orders: 0, revenue_tl: 0, revenue_usd: 0 } }; }
}

async function getTopProducts(limit = 5) {
  try {
    const sheets = await getSheets();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: config.dashboardSheetId,
      range: 'PRODUCT_SALES!A:E'
    });
    const rows = res.data.values || [];
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const products = [];
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === currentMonth) {
        products.push({
          sku_code: rows[i][1], product_name: rows[i][2],
          quantity: parseInt(rows[i][3]) || 0, revenue: parseFloat(rows[i][4]) || 0
        });
      }
    }
    return products.sort((a, b) => b.quantity - a.quantity).slice(0, limit);
  } catch { return []; }
}

module.exports = { detectMarketplace, processOrderEmail, saveOrder, getMonthlyStats, getTopProducts };
