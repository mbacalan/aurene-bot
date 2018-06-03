module.exports = {
  name: "ping",
  aliases: ["pong"],
  description: "Get the avarage heartbeat ping of the websocket",
  execute(message) {
    try {
      message.channel.send(`${message.client.ping}ms`);
    } catch (err) {
      console.log(err);
    }
  },
};
