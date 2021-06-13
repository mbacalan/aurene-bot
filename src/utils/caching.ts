import { model } from "mongoose";
import { gw2api, logger } from "./";

let errors = false;
const promises = [];
const endpoints = [
  "achievements",
  "specializations",
  "titles",
  "worlds",
  // "currencies",
  // "items",
  // "itemstats",
  // "minis",
  // "recipes",
  // "skins",
  // "skills",
  // "traits",
];

async function cacheToDbFromApi(endpoint) {
  const response = await gw2api[endpoint.toLowerCase()]().live().all().catch(() => {
    errors = true;
    logger.error(`Error getting all ${endpoint} from API`);
    return false;
  });

  if (!response) return;

  await model(`gw2.${endpoint}`).deleteMany({});
  await model(`gw2.${endpoint}`).create(response);
}

export async function buildDbFromApi() {
  endpoints.forEach(function pushToPromises(endpoint) {
    promises.push(cacheToDbFromApi(endpoint));
  });

  await Promise.all(promises);

  if (errors) {
    return logger.warn("There were errors while caching API to DB");
  }

  logger.info("Successfully cached API to DB");
}
