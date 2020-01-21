const { db } = require("./db");
const { gw2api } = require("./api");
const logger = require("./logger");

let errors = false;
const promises = [];
const endpoints = [
  "items",
  "achievements",
  "itemstats",
  "titles",
  "recipes",
  "skins",
  "currencies",
  "skills",
  "specializations",
  "traits",
  "worlds",
  "minis",
];

async function cacheToDbFromApi(endpoint) {
  await cachePvpAmulets();

  const response = await gw2api[endpoint]().live().all().catch((error) => {
    errors = true;
    logger.error(`Error getting all ${endpoint} from API`, error);
    return false;
  });

  if (!response) return;

  await db.collection(`gw2.${endpoint}`).insertMany(response);
}

async function cachePvpAmulets() {
  const pvpAmulets = await gw2api.pvp().amulets().live().all().catch((error) => {
    errors = true;
    logger.error("Error getting all pvp amulets from API", error);
    return false;
  });

  if (!pvpAmulets) return;

  await db.collection("gw2.pvpAmulets").insertMany(pvpAmulets);
}

async function buildDbFromApi() {
  endpoints.forEach(function pushToPromises(endpoint) {
    promises.push(cacheToDbFromApi(endpoint));
  });

  await Promise.all(promises);

  if (errors) {
    return logger.warn("There were errors while caching API to DB");
  }

  logger.info("Successfully cached API to DB");
}

module.exports = {
  buildDbFromApi,
};
