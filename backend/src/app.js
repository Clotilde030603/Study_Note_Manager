const express = require('express');
const cors = require('cors');
require('dotenv').config();

const noteRoutes = require('./routes/noteRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

// README 설명용: frontend 컨테이너 또는 localhost 개발 환경에서 API를 호출할 수 있도록 CORS를 허용한다.
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));

// README 설명용: 모든 API 요청/응답은 UTF-8 JSON을 기본 형식으로 사용한다.
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
