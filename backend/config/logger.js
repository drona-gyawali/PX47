import pino from 'pino';
import fs from 'fs';
import { join } from 'path';

const logDir = '../logs';
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const streams = [
  { stream: process.stdout },
  { stream: pino.destination({ dest: join(logDir, 'app.log'), sync: false }) },
];

const logger = pino(
  {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  pino.multistream(streams),
);

export { logger };
