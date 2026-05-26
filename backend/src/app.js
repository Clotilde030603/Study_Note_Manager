const express = require('express');
const cors = require('cors');
require('dotenv').config();

const noteRoutes = require('./routes/noteRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

// CORS 기본 origin은 로컬 frontend 주소로 제한한다.
// 보안상 환경변수 누락 시 모든 origin(*)을 허용하지 않고 로컬 과제 실행 주소로만 제한한다.
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:8080';
if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN) {
  console.warn('[security] CORS_ORIGIN is not set. Falling back to http://localhost:8080');
}

app.use(cors({
  origin: corsOrigin
}));

// API 요청/응답은 UTF-8 JSON을 기본 형식으로 사용한다.
app.use(express.json({ type: 'application/json' }));
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Study Note Manager backend is running.',
    docs: {
      health: '/api/health',
      notes: '/api/notes'
    }
  });
});

app.use('/api/health', healthRoutes);
app.use('/api/notes', noteRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API route not found.' });
});

app.use((error, req, res, next) => {
  console.error('[api] unexpected error:', error.message);
  res.status(500).json({
    success: false,
    message: 'Internal server error.',
    error: process.env.NODE_ENV === 'production' ? undefined : error.message
  });
});

module.exports = app;
