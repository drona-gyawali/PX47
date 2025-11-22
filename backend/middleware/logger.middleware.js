import { logger } from '../config/logger.js';

function LoggerMiddleware(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const msg = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
    logger.info(msg);

    if (duration > 500) {
      logger.warn(`slow request ${msg}`);
    }
  });

  next();
}

export { LoggerMiddleware };
