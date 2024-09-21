// utils/cache.js

const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 }); // Cache expires after 1 hour

const getCache = (key) => {
  return cache.get(key);
};

const setCache = (key, value) => {
  cache.set(key, value);
};

module.exports = { getCache, setCache };
