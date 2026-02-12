/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  🍄 MYCOVITA OS v2.0                                          ║
 * ║  E-Commerce Dashboard & Automation                            ║
 * ║  Platform: Google Cloud Run                                   ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

const express = require('express');
const path = require('path');
const config = require('./config');
const apiRoutes = require('./routes/api');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// API routes
app.use('/api', apiRoutes);

// Dashboard (ana sayfa)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'dashboard.html'));
});

// Start
app.listen(config.port, () => {
  console.log(`🍄 MYCOVITA OS v2.0 çalışıyor → http://localhost:${config.port}`);
  console.log(`📊 Dashboard → http://localhost:${config.port}`);
  console.log(`🔌 API → http://localhost:${config.port}/api/health`);
});
