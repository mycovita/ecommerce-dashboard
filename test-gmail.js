const { google } = require('googleapis');

async function test() {
  try {
    const auth = new google.auth.JWT({
      keyFile: './gmail-key.json',
      scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
      subject: 'info@mycovita.bio'
    });
    
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.labels.list({ userId: 'me' });
    console.log('BAŞARILI! Etiketler:', res.data.labels.map(l => l.name).join(', '));
  } catch (e) {
    console.error('HATA:', e.message);
    if (e.response) console.error('DETAY:', JSON.stringify(e.response.data));
  }
}

test();
