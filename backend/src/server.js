require('dotenv').config();
const app = require('./app');
const { waitForDatabase } = require('./db/pool');

const PORT = Number(process.env.PORT || 5001);

async function startServer() {
  // README 설명용: Compose의 depends_on과 별도로 backend 내부에서도 MySQL 준비 완료까지 재시도한다.
  await waitForDatabase();

  app.listen(PORT, () => {
    console.log(`[server] Study Note Manager API listening on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('[server] failed to start:', error);
  process.exit(1);
});
