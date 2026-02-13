/**
 * 🍄 MYCOVITA OS v2.0 - GOOGLE AUTH
 * Google API'leri için kimlik doğrulama
 * Cloud Run'da otomatik service account kullanır
 * Gmail için Domain-Wide Delegation ile kullanıcı adına erişir
 */

const { google } = require('googleapis');

let _auth = null;

async function getAuth() {
  if (_auth) return _auth;
  _auth = new google.auth.GoogleAuth({
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/cloud-platform',
      'https://www.googleapis.com/auth/documents'
    ]
  });
  return _auth;
}

async function getDrive() {
  const auth = await getAuth();
  return google.drive({ version: 'v3', auth });
}

async function getSheets() {
  const auth = await getAuth();
  return google.sheets({ version: 'v4', auth });
}

async function getGmail() {
  const gmailUser = process.env.GMAIL_USER;
  if (!gmailUser) throw new Error('GMAIL_USER env değişkeni ayarlanmamış');
  
  // gmail-key.json dosyasını doğrudan oku
  const path = require('path');
  const fs = require('fs');
  const keyPath = path.join(__dirname, '..', '..', 'gmail-key.json');
  
  if (!fs.existsSync(keyPath)) throw new Error('gmail-key.json bulunamadı: ' + keyPath);
  
  const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  
  const auth = new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: [
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.labels',
      'https://www.googleapis.com/auth/gmail.readonly'
    ],
    subject: gmailUser
  });
  
  return google.gmail({ version: 'v1', auth });
}

async function getAccessToken() {
  const auth = await getAuth();
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token;
}

module.exports = { getAuth, getDrive, getSheets, getGmail, getAccessToken };
