module.exports = {
  name: "avatar",
  description: "Get the avatar of a user",
  execute(message, args) {
    try {
      if (!user) {
        message.reply(message.author.avatarURL);
      } else if (user) {
        message.reply(user.avatarURL);
      }
    } catch (err) {
      console.log(err);
    }
  }
}
