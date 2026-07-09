import memoryCache from './memoryCache';

// This is the cache strategy. In the future, you can swap memoryCache with redisCache easily.
const cacheStrategy = memoryCache;

export const getCache = async (key) => {
  return await cacheStrategy.get(key);
};

export const setCache = async (key, value, ttl = null) => {
  return await cacheStrategy.set(key, value, ttl);
};

export const deleteCache = async (key) => {
  return await cacheStrategy.delete(key);
};
