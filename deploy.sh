#!/bin/bash
echo "🚀 MYCOVITA Dağıtım Sistemi Başlatılıyor..."

# 1. Mesajı al
MSG="$1"
if [ -z "$MSG" ]; then
  MSG="Otomatik guncelleme"
fi

# 2. GitHub'a Gönder
echo "📦 GitHub'a gönderiliyor..."
git add .
# Hatayı düzelttik: --allow-empty
git commit --allow-empty -m "$MSG"
git push origin main

# 3. Google Cloud'a Yükle
echo "☁️  Google Cloud Build başlatılıyor..."
gcloud builds submit --config cloudbuild.yaml . --region=europe-west3
