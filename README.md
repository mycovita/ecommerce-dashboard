# 🍄 MYCOVITA OS v2.0

E-Commerce Dashboard & Automation — Google Cloud Run üzerinde çalışan Node.js uygulaması.

## Mimari

```
mycovita-os/
├── src/
│   ├── app.js              # Express server (ana giriş)
│   ├── config/
│   │   ├── index.js         # Ayarlar (.env'den okur)
│   │   ├── folders.js       # Drive klasör eşleştirmeleri
│   │   └── google-auth.js   # Google API kimlik doğrulama
│   ├── routes/
│   │   └── api.js           # REST API endpoints
│   └── services/
│       ├── ai.js            # Gemini AI (dosya + sipariş analizi)
│       ├── currency.js      # Döviz kuru (USD/TRY)
│       ├── drive.js         # Drive dosya sınıflandırma
│       ├── gmail.js         # Gmail sipariş tarama
│       ├── log.js           # Loglama (Sheets + console)
│       ├── marketplace.js   # Sipariş yönetimi
│       ├── sku.js           # Ürün eşleştirme
│       ├── stats.js         # Dashboard istatistikleri
│       └── weather.js       # Hava durumu (Open-Meteo)
├── public/
│   └── dashboard.html       # Web dashboard UI
├── .env                     # 🔒 Hassas bilgiler (GitHub'da YOK)
├── .env.example             # Örnek env dosyası
├── .gitignore               # .env ve node_modules hariç tutar
├── Dockerfile               # Cloud Run deployment
├── package.json             # Bağımlılıklar
└── README.md                # Bu dosya
```

## API Endpoints

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/dashboard` | Tüm dashboard verileri |
| POST | `/api/run` | Gmail + Drive tam tarama |
| POST | `/api/gmail` | Sadece Gmail tara |
| POST | `/api/drive` | Sadece Drive tara |
| GET | `/api/health` | Sağlık kontrolü |

## Ne Yapıyor?

1. **Gmail Tarama**: SIPARISLER etiketli e-postaları tarar, AI ile sipariş bilgilerini çıkarır
2. **Drive Sınıflandırma**: INBOX klasörüne atılan dosyaları AI ile analiz edip doğru klasöre taşır
3. **Dashboard**: Hava durumu, döviz, sipariş istatistikleri, log takibi
4. **38 kategori**: Fatura, sözleşme, IoT, üretim, lab raporu vb. otomatik sınıflandırma

## Kurulum

```bash
# 1. Repo'yu klonla
git clone https://github.com/mycovita/ecommerce-dashboard.git
cd ecommerce-dashboard

# 2. .env dosyasını oluştur
cp .env.example .env
# .env içindeki değerleri doldur

# 3. Bağımlılıkları kur
npm install

# 4. Çalıştır
npm start
```

## Cloud Run Deployment

```bash
# Build & Deploy
gcloud run deploy mycovita-os \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="$(cat .env | grep -v '^#' | tr '\n' ',')"
```
