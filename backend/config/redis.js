import Redis from 'ioredis';
import { REDIS_URL, NODE_ENV } from '../config/conf.js';

let redis;

if (!redis) {
  redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  });
}

if (NODE_ENV !== 'production') global.redis = global.redis || redis;

export default redis;
