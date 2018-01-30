module.exports = {
  name: "avatar",
  description: "Get the avatar of a user",
  execute(message) {
    try {
      if (!message.mentions.users.size) {
        return message.reply(`, here is your avatar: ${message.author.avatarURL}`);
      }

      const avatarList = message.mentions.users.map(user => {
        return `${user.username}'s avatar: ${user.displayAvatarURL}`;
      });

      message.channel.send(avatarList);

    } catch (err) {
      console.log(err);
    }
  },
};
