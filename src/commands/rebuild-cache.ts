import { ActivityType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { logger, buildDbFromApi } from "../utils";
import { Command } from "../types";

class RebuildCache implements Command {
  name = "rebuildcache";
  description = "Rebuild Cache";
  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description)
    .setDefaultMemberPermissions(0);

  async execute(interaction: ChatInputCommandInteraction) {
    interaction.deferReply({ ephemeral: true });
    logger.info("(Re)building API cache");
    interaction.client.user.setStatus("dnd");
    interaction.client.user.setActivity("Building API Cache", { type: ActivityType.Listening });
    await buildDbFromApi();
    interaction.client.user.setStatus("online");
    interaction.client.user.setActivity("Guild Wars 2");
    interaction.editReply({ content: "Done" });
  }
}

export = new RebuildCache();
