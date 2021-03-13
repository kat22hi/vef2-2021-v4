// TODO útfæra redis cache
import redis from 'redis';
import util from 'util';
import dotenv from 'dotenv';

dotenv.config();

export let getCacheData; // eslint-disable-line import/no-mutable-exports
export let setCacheData; // eslint-disable-line import/no-mutable-exports

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
    const earthquakes = await getAsync(key);
    return earthquakes;
  };

  setCacheData = async (key, earthquakes) => {
    await setAsync(key, earthquakes);
  };
} catch (e) {
  console.error('Error setting up redis client, running without cache', e);
  getCacheData = async (key) => false; // eslint-disable-line no-unused-vars
  setCacheData = async (key, value) => { }; // eslint-disable-line no-unused-vars
}