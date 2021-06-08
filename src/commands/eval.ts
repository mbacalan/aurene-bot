import { Command, CommandParams } from "../types";

class Eval implements Command {
  name = "eval";
  description = "Evaluate JS code";

  execute({ message, isOwner }: CommandParams) {
    if (!isOwner) return;

    const clean = text => {
      if (typeof (text) === "string") {
        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
      } else {
        return text;
      }
    };

    const args = message.content.split(" ").slice(1);

    try {
      const code = args.join(" ");
      let evaled = eval(code);

      if (typeof evaled !== "string") {
        evaled = require("util").inspect(evaled);
      }

      message.channel.send(clean(evaled), { code: "xl" });
    } catch (err) {
      message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
    }
  }
}

export = new Eval();
