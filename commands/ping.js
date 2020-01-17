const { RichEmbed } = require("discord.js");

class Ping {
  constructor() {
    this.name = "ping";
    this.aliases = ["pong"];
    this.description = "Get the avarage heartbeat ping of the websocket";
  }

  execute(message) {
    try {
      const pingEmbed = new RichEmbed()
        .setColor("#1a9306")
        .setTitle("Pong 🏓")
        .addField("Websocket Latency:", `${Math.round(message.client.ping)}ms`, true);

      message.channel.send(pingEmbed).catch(() => {
        message.channel.send(`Websocket latency is ${Math.round(message.client.ping)}ms.`);
      });
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = new Ping;
