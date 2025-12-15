import dotenv from 'dotenv';

// Cargar variables de entorno ANTES de cualquier otra cosa
dotenv.config();

import { createApp } from './app';
import { env } from './config/environment';

const app = createApp();

// Inicia el servidor en el puerto configurado
app.listen(env.PORT, () => {
  console.log(`🚀 API Gateway running on port ${env.PORT}`);
  console.log(`📡 Python MS: ${env.PYTHON_MS_URL}`);
  console.log(`📡 Node MS: ${env.NODE_MS_URL}`);
  console.log(`✅ Health check: http://localhost:${env.PORT}/health`);
});