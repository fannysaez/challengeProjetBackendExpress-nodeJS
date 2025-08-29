const redis = require('redis');

const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379
  }
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

async function connectToRedis() {
  try {
    await redisClient.connect();
    console.log('Connecté à Redis');
  } catch (error) {
    console.error('Erreur de connexion à Redis:', error);
    throw error;
  }
}

function getRedisClient() {
  return redisClient;
}

module.exports = { connectToRedis, getRedisClient };