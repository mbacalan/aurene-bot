const apiClient = require("gw2api-client");
const redis = require("redis");
const cacheRedis = require("../node_modules/gw2api-client/src/cache/redis.js");

const options = {
  redis: redis.createClient(process.env.REDIS_URL),
};

const gw2api = apiClient();

gw2api.cacheStorage(cacheRedis(options));

module.exports = { gw2api };
