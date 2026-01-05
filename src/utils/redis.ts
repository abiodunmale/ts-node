import { createClient } from 'redis';
import logger from './logger';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => logger.error(err, 'Redis Client Error'));

// Connect on startup
(async () => {
  await redisClient.connect();
  logger.info('Redis connected');
})();

export default redisClient;