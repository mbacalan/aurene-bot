const { MessageEmbed } = require("discord.js");

class Ping {
  constructor() {
    this.name = "ping";
    this.aliases = ["pong"];
    this.description = "Get the avarage heartbeat ping of the websocket";
  }

  execute({ message }) {
    const pingEmbed = new MessageEmbed()
      .setColor("#1a9306")
      .setTitle("Pong 🏓")
      .addField("Websocket Latency:", `${Math.round(message.client.ws.ping)}ms`, true);

    message.channel.send(pingEmbed).catch(() => {
      message.channel.send(`Websocket latency is ${Math.round(message.client.ws.ping)}ms.`);
    });
  }
}

module.exports = new Ping;
