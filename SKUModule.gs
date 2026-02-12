/**
 * 🍄 MYCOVITA OS - SKU MODULE
 * Ürün eşleştirme ve SKU yönetimi
 */

const SKUModule = {
  _cache: null,
  
  getList: function() {
    if (this._cache) return this._cache;
    try {
      const sheet = SpreadsheetApp.openById(CONFIG.SKU_SHEET_ID).getSheets()[0];
      const data = sheet.getDataRange().getValues();
      this._cache = [];
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[0]) {
          this._cache.push({
            sku_code: row[0],
            product_name: row[1],
            category: row[2],
            unit: row[3],
            aliases: row[4] ? row[4].toString().toLowerCase().split(',').map(s => s.trim()) : [],
            active: row[5] !== false && row[5] !== 'FALSE'
          });
        }
      }
      return this._cache;
    } catch(e) { return []; }
  },
  
  getAsText: function() {
    const list = this.getList();
    return list.map(p => `${p.sku_code}: ${p.product_name} (${p.unit}) [${p.aliases.join(', ')}]`).join('\n');
  },
  
  findMatch: function(productName) {
    const list = this.getList();
    const searchTerm = productName.toLowerCase();
    for (const sku of list) {
      if (sku.product_name.toLowerCase() === searchTerm) return sku;
    }
    for (const sku of list) {
      for (const alias of sku.aliases) {
        if (searchTerm.includes(alias) || alias.includes(searchTerm)) return sku;
      }
    }
    return null;
  }
};
