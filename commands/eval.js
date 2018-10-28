module.exports = {
  name: "eval",
  description: "Evaluate JavaScript",
  execute(message) {
    try {

      const clean = text => {
        if (typeof (text) === "string") {
          return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
        } else {
          return text;
        }
      };

      const args = message.content.split(" ").slice(1);

      if (message.content.startsWith(process.env.PREFIX + "eval")) {
        if(message.author.id !== process.env.OWNER) return;
        try {
          const code = args.join(" ");
          let evaled = eval(code);

          if (typeof evaled !== "string") {
            evaled = require("util").inspect(evaled);
          }

          message.channel.send(clean(evaled), { code:"xl" });
        } catch (err) {
          message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
        }
      }

    } catch (err) {
      console.log(err);
    }
  },
};
