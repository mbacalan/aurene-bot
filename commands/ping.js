const { RichEmbed } = require("discord.js");

module.exports = {
  name: "ping",
  aliases: ["pong"],
  description: "Get the avarage heartbeat ping of the websocket",
  execute(message) {
    try {
      const pingEmbed = new RichEmbed()
        .setColor("#1a9306")
        .setTitle("Pong 🏓")
        .addField("Websocket Latency:", `${message.client.ping}ms`, true);

      message.channel.send(pingEmbed)
        .catch(() => {
          message.reply("it looks like I don't have permissions to send an embed. Here is a boring version instead:");
          message.channel.send(`Websocket latency is ${message.client.ping}ms.`);
        });
    } catch (err) {
      console.log(err);
    }
  },
};
