import { CommandInteraction, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { gw2api, getLeadingGuilds, formatAge, filterExpansions } from "../../utils";
import { Keys, Worlds } from "../../models";
import { Command } from "../../types";

class Account implements Command {
  name = "account";
  description = "See your GW2 account information";
  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  async execute(interaction: CommandInteraction) {
    const { key } = await Keys.findOne({ discordId: interaction.user.id });

    if (!key) {
      interaction.reply({
        content: "I couldn't find a GW2 API key associated with your Discord account!",
        ephemeral: true
      });

      return;
    }

    interaction.deferReply();

    gw2api.authenticate(key);

    const account = await gw2api.account().get();
    const { created, name, wvw_rank, fractal_level, commander } = account;
    const world = await Worlds.findOne({ id: account.world });
    const age = formatAge(account.age);
    const guilds = await getLeadingGuilds(account);
    const expansions = filterExpansions(account);
    const creationDate = new Date(created).toDateString();
    const pvp = await gw2api.account().pvp().stats().get();
    const { pvp_rank } = pvp;

    const accountEmbed = new MessageEmbed()
      .setTitle(name)
      .addField("Created at", creationDate, true)
      .addField("Age", age, true)
      .addField("\u200b", "\u200b", true)
      .addField("Has Expansions", expansions, true)
      .addField("World", world.name, true)
      .addField("\u200b", "\u200b", true)
      .addField("WvW Rank", String(wvw_rank), true)
      .addField("PvP Rank", String(pvp_rank), true)
      .addField("\u200b", "\u200b", true)
      .addField("Fractal Level", String(fractal_level), true)
      .addField("Commander", commander ? "Yes" : "No", true)
      .addField("\u200b", "\u200b", true)
      .addField("Leads", guilds, true);

    interaction.editReply({ embeds: [accountEmbed]} ).catch(() => {
      interaction.editReply({ content: "I'm lacking permissions to send an embed!" });
    });
  }
}

export = new Account();
