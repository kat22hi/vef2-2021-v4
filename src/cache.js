import redis from 'redis';
import util from 'util';
import dotenv from 'dotenv';

dotenv.config();
export let getCacheData;
export let setCacheData;

const {
  REDIS_URL: redisUrl= 'redis://127.0.0.1:6379/0',
} = process.env;

try {
  if (!redisUrl) {
    throw Error('No redis url');
  }

  const client = redis.createClient({
    url: redisUrl,
  });

  const getAsync = util.promisify(client.get).bind(client);
  const setAsync = util.promisify(client.set).bind(client);

  getCacheData = async (key) => {
    const earthquakesData = await getAsync(key);
    return earthquakesData;
  };

  setCacheData = async (key, earthquakesData) => {
    await setAsync(key, earthquakesData);
  };
} catch (e) {
  console.error('Error setting up redis client, running without cache', e);
  getCacheData = async (key) => false;
  setCacheData = async (key, value) => { };
}