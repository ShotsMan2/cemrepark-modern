import redisCache from "./redisCache";

// This is the cache strategy. It now uses Redis caching as per Phase 1.
const cacheStrategy = redisCache;

export const getCache = async (key) => {
  return await cacheStrategy.get(key);
};

export const setCache = async (key, value, ttl = null) => {
  return await cacheStrategy.set(key, value, ttl);
};

export const deleteCache = async (key) => {
  return await cacheStrategy.delete(key);
};
