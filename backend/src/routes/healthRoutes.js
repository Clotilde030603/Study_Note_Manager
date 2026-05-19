const express = require('express');
const { pool } = require('../db/pool');

const router = express.Router();

// README 설명용: /api/health는 서버와 DB 연결 상태를 JSON으로 확인하는 상태 점검 API다.
router.get('/', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({
      success: true,
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[api] health check failed:', error.message);
    return res.status(503).json({
      success: false,
      status: 'error',
      database: 'disconnected',
      message: 'Database connection failed.',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
