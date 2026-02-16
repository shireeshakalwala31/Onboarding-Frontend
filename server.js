const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// 🔧 FIX: Increase body parser limits
// ============================================

// Increase JSON body limit to 50MB (default is 100kb which causes PayloadTooLargeError)
app.use(bodyParser.json({ limit: '50mb' }));

// Increase URL-encoded body limit to 50MB
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Increase raw body limit to 50MB
app.use(bodyParser.raw({ limit: '50mb' }));

// ============================================
// CORS Configuration
// ============================================
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ============================================
// API Proxy Configuration
// ============================================

// Your existing backend URL
const API_BASE_URL = process.env.API_BASE_URL || 'https://offer-documentation.onrender.com/api';

// Proxy all /api requests to the backend
app.use('/api', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${API_BASE_URL}${req.path}`,
      data: req.body,
      params: req.query,
      headers: {
        ...req.headers,
        host: undefined, // Remove host header to avoid conflicts
      },
      timeout: 0, // No timeout for large requests
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      res.status(502).json({ message: 'Bad Gateway - Backend service unavailable', error: error.message });
    } else {
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }
});

// ============================================
// Serve React Static Files
// ============================================
app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// ============================================
// Start Server
// ============================================
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API requests forwarded to: ${API_BASE_URL}`);
  console.log(`Body parser limit: 50MB (fixed PayloadTooLargeError)`);
  console.log(`========================================`);
});
