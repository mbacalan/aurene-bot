import { Command, CommandParams } from "../types";
import { Util } from 'discord.js';

class Help implements Command {
  name = "help";
  description = "List all of my commands or info about a specific command.";
  args = false;
  aliases = ["commands"];
  usage = "[command name]";

  // TODO: Clean up the mess
  execute({ message, args }: CommandParams) {
    const { commands } = message.client;
    const data = [];

    if (!args.length) {
      data.push("Here's a list of all my commands:");
      data.push(commands.map(command => command.name).join(", "));
      data.push(`\nYou can send \`${process.env.PREFIX}help [command name]\` to get info on a specific command!`);
    } else {
      if (!commands.has(args[0])) {
        return message.reply("that's not a valid command!");
      }

      const command = commands.get(args[0]);

      data.push(`**Name:** ${command.name}`);
      if (command.description) data.push(`**Description:** ${command.description}`);
      if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(", ")}`);
      if (command.usage) data.push(`**Usage:** ${process.env.PREFIX}${command.name} ${command.usage}`);
    }

    message.author.send({ content: data.join("\n") })
      .then(() => {
        if (message.channel.type !== "DM") {
          message.reply("I've sent you a DM with all my commands!");
        }
      })
      .catch(() => message.reply("it seems like I can't DM you!"));
  }
}

export = new Help();
