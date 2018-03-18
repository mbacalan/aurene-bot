module.exports = {
  name: "readycheck",
  aliases: ["rc"],
  description: "Ask if members are ready and use reactions to determine the result",
  execute(message) {
    try {
      message.channel.send("Are you ready?")
        .then(async m => {
          await m.react("✅");
          await m.react("❌");
        });
    } catch (error) {
      console.log(error);
    }
  },
};
