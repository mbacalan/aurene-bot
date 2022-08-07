import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { gw2api, getLeadingGuilds, formatAge, filterExpansions } from "../../utils";
import { Keys, Worlds } from "@mbacalan/aurene-database";
import { Command } from "../../types";

class Account implements Command {
  name = "account";
  description = "See your GW2 account information";
  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  async execute(interaction: ChatInputCommandInteraction) {
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

    const accountEmbed = new EmbedBuilder()
      .setTitle(name)
      .addFields([
        { name: "Created at", value: creationDate },
        { name: "Age", value: age },
        { name: "\u200b", value: "\u200b" },
        { name: "Has Expansions", value: expansions },
        { name: "World", value: world.name },
        { name: "\u200b", value: "\u200b" },
        { name: "WvW Rank", value: String(wvw_rank) },
        { name: "PvP Rank", value: String(pvp_rank) },
        { name: "\u200b", value: "\u200b" },
        { name: "Fractal Level", value: String(fractal_level) },
        { name: "Commander", value: commander ? "Yes" : "No" },
        { name: "\u200b", value: "\u200b" },
        { name: "Leads", value: guilds },
      ])

    interaction.editReply({ embeds: [accountEmbed]} ).catch(() => {
      interaction.editReply({ content: "I'm lacking permissions to send an embed!" });
    });
  }
}

export = new Account();
