const express = require('express');
const path = require('path');
const { google } = require('googleapis');
const app = express();
const port = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, '../public')));

// Google Sheets Bağlantısı
async function getOrders() {
    const auth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    // Tabloyu Oku
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: 'SENIN_KOPYALADIGIN_UZUN_KOD_BURAYA_GELECEK',
        range: 'Sayfa1!A:E', // Sayfa adın farklıysa burayı düzelt
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return [];

    // Başlıkları atla, veriyi JSON'a çevir
    const headers = rows[0]; 
    return rows.slice(1).map(row => {
        return {
            tarih: row[0],
            musteri: row[1],
            urun: row[2],
            tutar: row[3],
            durum: row[4]
        };
    });
}

// API: Verileri Panele Gönder
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await getOrders();
        
        // Toplam Ciro Hesapla
        let totalRevenue = 0;
        let pendingCount = 0;
        
        orders.forEach(o => {
            let amount = parseFloat(o.tutar.replace(/[^\d.-]/g, '')) || 0; // "1.200 TL" -> 1200
            totalRevenue += amount;
            if(o.durum === 'Bekliyor') pendingCount++;
        });

        res.json({
            orders: orders.slice(0, 5), // Son 5 sipariş
            totalRevenue: totalRevenue,
            totalOrders: orders.length,
            pendingOrders: pendingCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Veri çekilemedi' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.listen(port, () => {
    console.log(`Sunucu çalışıyor: ${port}`);
});
