import { CommandInteraction, MessageEmbed, TextChannel } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { logger, endGiveaway, createGiveawayEntryCollector } from "../utils";
import { Guilds } from "../models";
import { Command, IGiveaway } from "../types";

class Giveaway implements Command {
  name = "giveaway";
  description = "Create a giveaway";
  giveawayChannel: TextChannel;
  data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description)
    .addSubcommand(sub =>
      sub
        .setName("create")
        .setDescription(this.description)
        .addStringOption(option =>
          option
            .setName("item")
            .setDescription("The thing you are giving away")
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("duration")
            .setDescription("Duration of the giveaway, e.g. 2h or 10min")
            .setRequired(true)
        )
        .addRoleOption(option =>
          option
            .setName("role")
            .setDescription("Optionally, mention a role with for the giveaway")
        )
    );

  async execute(interaction: CommandInteraction) {
    // TODO: Get GIVEAWAY_CHANNEL from guild config
    this.giveawayChannel = interaction.client.channels.cache.get(process.env.GIVEAWAY_CHANNEL) as TextChannel;

    await this.create(interaction);

    // TODO: Since we support multiple giveaways at once, the info command needs a rework
    // to display information about any given active giveaway without cluttering the channel.
  }

  async create(interaction: CommandInteraction) {
    if (this.giveawayChannel && (interaction.channel.id != this.giveawayChannel.id)) {
      interaction.reply({
        content: `You can only create giveaways in ${this.giveawayChannel} channel.`,
        ephemeral: true
      });

      return;
    }

    const item = interaction.options.getString("item");
    const duration = interaction.options.getString("duration");
    const role = interaction.options.getRole("role");

    if (
      Number.isNaN(parseInt(duration, 10)) ||
      (!duration.includes("m") && !duration.includes("h")) ||
      (duration.includes("m") && duration.includes("h"))
    ) {
      await interaction.reply({
        content: "I don't understand the duration format. Please use something like: ``5min`` or ``2h``",
        ephemeral: true
      });

      return;
    }

    // If the collectedDuration includes "h" in it,
    // parse the string into an integer and multiply it with an hour in milliseconds
    const durationType = duration.includes("m", 1) ? "minute" : "hour";
    const intDuration = parseInt(duration, 10);
    let endTime = new Date();

    if (durationType == "minute") {
      endTime.setMinutes(endTime.getMinutes() + intDuration);
    } else if (durationType == "hour") {
      endTime.setHours(endTime.getHours() + intDuration);
    }

    interaction.deferReply({ ephemeral: true });

    const infoEmbed = new MessageEmbed()
      .setTitle(item)
      .addField("Hosted By", interaction.user.tag, true)
      .addField("Duration", duration, true)
      .setFooter("Enter this giveaway by reacting with checkmark below.");

    const giveawayMessage = await interaction.channel.send({
      content: role?.toString() || "Here's a giveaway for you!",
      embeds: [infoEmbed]
    })
      .catch(() => {
        return interaction.channel.send(`Hey ${role?.toString() || ""}, ${interaction.user} is giving away **${item}**! ` +
          "Use the reaction below to enter. " +
          `This giveaway will end in **${intDuration} ${durationType}**.`);
      });

    await giveawayMessage.react("✅");

    const guild = await Guilds.findOne({ _id: interaction.guild.id });

    try {
      guild.giveaways.push({
        _id: giveawayMessage.id,
        userId: interaction.user.id,
        userTag: interaction.user.tag,
        creationTime: interaction.createdAt,
        item: item,
        duration: duration,
        endTime: endTime,
      } as IGiveaway);

      await guild.save();
      interaction.editReply({
        content: "Giveaway created!",
      });
    } catch (error) {
      logger.error("Error creating giveaway ", error);
      interaction.editReply({
        content: "Oops! There was an issue creating the giveaway, please try again later.",
      });
      return;
    }

    const entryCollector = createGiveawayEntryCollector(guild, this.giveawayChannel, giveawayMessage);

    setTimeout(async () => {
      await endGiveaway(giveawayMessage, this.giveawayChannel);
      entryCollector.stop();
    }, endTime.getTime() - Date.now());
  }
}

export = new Giveaway();
