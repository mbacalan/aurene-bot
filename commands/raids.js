const {default: client} = require("gw2api-client");
const {default: cacheMemory} = require("gw2api-client/build/cache/memory");
const {apikey} = require("../bot_config.json");
const api = client();
api.authenticate(apikey);
// API cache
const options = {
  gcTick: 5 * 60 * 1000
};
api.cacheStorage(cacheMemory(options));
module.exports = {
    name: "raids",
    description: "Show weekly raid progression",
    execute (message) {
        api.account().raids().get().
        then(result => message.reply(result));
    }
};
