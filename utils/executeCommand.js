const logger = require("./logger");

async function executeCommand(bot, message) {
  // Prefix is either what's defined or the tag of the bot
  const prefixRegex = new RegExp(`^(<@!?${bot.user.id}>|\\${process.env.PREFIX})\\s*`);

  if (!prefixRegex.test(message.content) || message.author.bot) return;

  const [, matchedPrefix] = message.content.match(prefixRegex);
  const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // Check commands by name and alias
  const command = bot.commands.get(commandName) || bot.commands.find(
    cmd => cmd.aliases && cmd.aliases.includes(commandName)
  );

  if (!command) return;

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;

    if (command.usage) {
      reply += `\nThe proper usage would be: \`${process.env.PREFIX}${command.name} ${command.usage}\``;
    }

    return message.channel.send(reply);
  }

  try {
    const isOwner = message.author.id === process.env.OWNER;
    const isRanking = message.member.roles.cache.some(role => [process.env.LEADERS, process.env.OFFICERS].includes(role.id));

    message.channel.startTyping();

    if (command.init) {
      await command.init(message);
    }

    command.execute(message, args, isOwner, isRanking);
    message.channel.stopTyping(true);
  } catch (error) {
    logger.error("Error while executing command", error);
    message.reply("there was an error trying to execute that command!");
  }
}

module.exports = {
  executeCommand,
};
