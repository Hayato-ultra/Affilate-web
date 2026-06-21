import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config, validateEnv } from '../utils/config';
import { logger } from '../utils/logger';
import { getDb } from '../db/connection';
import { initRedis } from '../cache/cache';
import router from './routes';
import adminRouter from './admin-routes';
import authRouter from './auth-routes';
import { checkAlerts } from '../tracking/alert-service';
import { apiRateLimit } from '../middleware/rateLimit';
import { sanitizeInput } from '../middleware/sanitize';

for (const warning of validateEnv()) {
  console.warn(warning);
}

const app = express();
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'http:'],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      formAction: ["'self'"],
      baseUri: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  strictTransportSecurity: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});
const allowedOrigins = (() => {
  const raw = process.env.CORS_ORIGIN;
  const envOrigin = raw && raw !== '' ? raw : null;
  const origin = envOrigin || (process.env.NODE_ENV === 'production' ? null : 'http://localhost:5173');
  if (!origin) {
    console.warn('WARNING: CORS_ORIGIN not set in production — all origins allowed! Set CORS_ORIGIN env var.');
    return ['*'];
  }
  if (origin === '*') return ['*'];
  return origin.split(',').map(s => s.trim());
})();
app.use(cors({ origin: allowedOrigins.includes('*') ? '*' : allowedOrigins }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(apiRateLimit);
app.use(sanitizeInput);

app.use('/api', router);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);

app.get('/', (_req, res) => {
  res.json({
    name: 'Affiliate Aggregator Engine',
    version: '1.0.0',
    docs: '/api/docs',
  });
});

getDb();
initRedis();

app.listen(config.port, () => {
  logger.info({ port: config.port, env: config.nodeEnv }, 'Server started');
});

const ALERT_CHECK_INTERVAL = 5 * 60 * 1000;
setInterval(() => {
  checkAlerts().catch(err => logger.error({ error: err.message }, 'Periodic alert check failed'));
}, ALERT_CHECK_INTERVAL);
logger.info({ interval: '5m' }, 'Periodic price alert checking scheduled');

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down');
  process.exit(0);
});

export default app;
