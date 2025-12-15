import { startServer } from './startup';

startServer().catch((err) => {
  console.error('Fatal admin-service error:', err);
  process.exit(1);
});
