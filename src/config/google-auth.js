/**
 * 🍄 MYCOVITA OS v2.0 - GOOGLE AUTH
 * Google API'leri için kimlik doğrulama
 * Cloud Run'da otomatik service account kullanır
 */

const { google } = require('googleapis');

let _auth = null;

async function getAuth() {
  if (_auth) return _auth;
  _auth = new google.auth.GoogleAuth({
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.labels',
      'https://www.googleapis.com/auth/gmail.readonly',
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
  const auth = await getAuth();
  return google.gmail({ version: 'v1', auth });
}

async function getAccessToken() {
  const auth = await getAuth();
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token;
}

module.exports = { getAuth, getDrive, getSheets, getGmail, getAccessToken };
