import redis from "redis";
import apiClient from "gw2api-client";
import cacheRedis from "gw2api-client/src/cache/redis.js";

const redisClient = redis.createClient("redis://redis:6379");
const gw2api = apiClient();

gw2api.cacheStorage(
  cacheRedis({
    redis: redisClient,
  })
);

async function getLeadingGuilds(account) {
  const guilds = await Promise.all(
    account.guild_leader.map(async (guild) => {
      return await gw2api.guild().get(guild)
        .then(result => `${result.name} [${result.tag}]`);
    })
  );

  return guilds.join("\n");
}

export {
  gw2api,
  getLeadingGuilds,
  redisClient,
};
