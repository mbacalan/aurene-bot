import { MessageEmbed } from "discord.js";
import { Command, CommandParams } from "../types";

class Ping implements Command {
  name = "ping";
  aliases = ["pong"];
  description = "Get the avarage heartbeat ping of the websocket";

  execute({ message }: CommandParams) {
    const pingEmbed = new MessageEmbed()
      .setColor("#1a9306")
      .setTitle("Pong 🏓")
      .addField("Websocket Latency:", `${Math.round(message.client.ws.ping)}ms`, true);

    message.reply({ embeds: [pingEmbed] }).catch(() => {
      message.reply(`Websocket latency is ${Math.round(message.client.ws.ping)}ms.`);
    });
  }
}

export = new Ping();
