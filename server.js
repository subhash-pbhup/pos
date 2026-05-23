const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✓ MongoDB connected'))
  .catch(err => console.log('✗ MongoDB connection error:', err));

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/users', require('./routes/users'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/stores', require('./routes/stores'));
app.use('/api/forecasts', require('./routes/forecasts'));
app.use('/api/invoices', require('./routes/invoices'));

// Welcome Route
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Welcome to POS System API v2.0',
    version: '2.0.0',
    features: [
      'Barcode Scanning',
      'Invoice Printing',
      'Email Notifications',
      'SMS Alerts',
      'Data Export (CSV/PDF)',
      'Multi-store Support',
      'Inventory Forecasting'
    ],
    endpoints: {
      products: '/api/products',
      sales: '/api/sales',
      users: '/api/users',
      customers: '/api/customers',
      expenses: '/api/expenses',
      reports: '/api/reports',
      stores: '/api/stores',
      forecasts: '/api/forecasts',
      invoices: '/api/invoices'
    }
  });
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Barcode scanner page
app.get('/scanner', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'barcode-scanner.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗`);
  console.log(`║   POS System v2.0 - Full Featured           ║`);
  console.log(`╚════════════════════════════════════════════════╝
`);
  console.log(`✓ Server: http://localhost:${PORT}`);
  console.log(`✓ Frontend: http://localhost:${PORT}`);
  console.log(`✓ API: http://localhost:${PORT}/api`);
  console.log(`✓ Scanner: http://localhost:${PORT}/scanner`);
  console.log(`✓ Login: http://localhost:${PORT}/login.html\n`);
});
