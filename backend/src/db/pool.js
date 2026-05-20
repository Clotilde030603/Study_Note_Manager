const mysql = require('mysql2/promise');
require('dotenv').config();

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }
  return value;
}

// README 설명용: 모든 DB 접속 설정은 환경변수에서 읽어 Docker Compose와 로컬 실행을 모두 지원한다.
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'study_user',
  password: requireEnv('DB_PASSWORD'),
  database: process.env.DB_NAME || 'study_note_manager',
  charset: process.env.DB_CHARSET || 'utf8mb4',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  namedPlaceholders: true
};

const pool = mysql.createPool(dbConfig);

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log(`[db] MySQL connected: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    return true;
  } catch (error) {
    console.error('[db] MySQL connection failed:', error.message);
    return false;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// README 설명용: MySQL 컨테이너 초기화가 끝나기 전 backend가 종료되지 않도록 재시도하며 대기한다.
async function waitForDatabase() {
  const maxRetries = Number(process.env.DB_CONNECT_RETRIES || 30);
  const retryDelayMs = Number(process.env.DB_CONNECT_RETRY_DELAY_MS || 2000);
  let attempt = 1;

  while (maxRetries <= 0 || attempt <= maxRetries) {
    if (await testConnection()) {
      return true;
    }

    const limitText = maxRetries <= 0 ? 'unlimited' : maxRetries;
    console.log(`[db] Waiting for MySQL... (${attempt}/${limitText})`);
    await sleep(retryDelayMs);
    attempt += 1;
  }

  // README 설명용: 재시도 한도를 모두 사용해도 프로세스를 종료하지 않고 API 서버를 띄워 /api/health에서 상태를 확인할 수 있게 한다.
  console.error(`[db] MySQL not ready after ${maxRetries} attempts. Backend will keep running for health checks.`);
  return false;
}

module.exports = {
  pool,
  testConnection,
  waitForDatabase
};
