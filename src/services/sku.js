/**
 * 🍄 MYCOVITA OS v2.0 - SKU SERVICE
 * Ürün eşleştirme ve SKU yönetimi
 */

const config = require('../config');
const { getSheets } = require('../config/google-auth');

let _cache = null;

async function getList() {
  if (_cache) return _cache;
  try {
    const sheets = await getSheets();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: config.skuSheetId,
      range: 'A:F'
    });
    const rows = res.data.values || [];
    _cache = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[0]) {
        _cache.push({
          sku_code: row[0],
          product_name: row[1] || '',
          category: row[2] || '',
          unit: row[3] || '',
          aliases: row[4] ? row[4].toString().toLowerCase().split(',').map(s => s.trim()) : [],
          active: row[5] !== false && row[5] !== 'FALSE'
        });
      }
    }
    return _cache;
  } catch (e) {
    console.error('⚠️ SKU listesi hatası:', e.message);
    return [];
  }
}

async function getAsText() {
  try {
    const list = await getList();
    return list.map(p => `${p.sku_code}: ${p.product_name} (${p.unit}) [${p.aliases.join(', ')}]`).join('\n');
  } catch (e) {
    console.error('⚠️ SKU text hatası:', e.message);
    return '';
  }
}

async function findMatch(productName) {
  try {
    const list = await getList();
    const search = productName.toLowerCase();
    for (const sku of list) {
      if (sku.product_name.toLowerCase() === search) return sku;
    }
    for (const sku of list) {
      for (const alias of sku.aliases) {
        if (search.includes(alias) || alias.includes(search)) return sku;
      }
    }
    return null;
  } catch (e) {
    console.error('⚠️ SKU match hatası:', e.message);
    return null;
  }
}

module.exports = { getList, getAsText, findMatch };
