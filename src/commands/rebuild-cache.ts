import { Command, CommandParams } from "../types";
import { logger, buildDbFromApi } from "../utils";

class RebuildCache implements Command {
  name = "rebuildcache";
  description = "Rebuild Cache";

  async execute({ message, isOwner }: CommandParams) {
    if (!isOwner) return;

    logger.info("(Re)building API cache");
    message.client.user.setStatus("dnd");
    message.client.user.setActivity("Building API Cache", { type: "LISTENING" });
    await buildDbFromApi();
    message.client.user.setStatus("online");
    message.client.user.setActivity("Guild Wars 2");
    message.react("✅");
  }
}

export = new RebuildCache();
