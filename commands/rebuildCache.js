const { buildDbFromApi } = require("../utils/caching");
const logger = require("../utils/logger");

class RebuildCache {
  constructor() {
    this.name = "rebuildcache";
    this.description = "Rebuild Cache";
  }

  async execute({ message, isOwner }) {
    if (!isOwner) return;

    logger.info("(Re)building API cache");
    await message.client.user.setStatus("dnd");
    await message.client.user.setActivity("Building API Cache", { type: "LISTENING" });
    await buildDbFromApi();
    await message.client.user.setStatus("online");
    await message.client.user.setActivity("Guild Wars 2");
  }
}

module.exports = new RebuildCache();
