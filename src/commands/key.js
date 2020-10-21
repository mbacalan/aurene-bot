const { validateKey } = require("../utils/general");
const { createKey, deleteKey } = require("../utils/db");
const { gw2api } = require("../utils/api");
const logger = require("../utils/logger");

class Key {
  constructor() {
    this.name = "key";
    this.args = true;
    this.description = "Add your GW2 API key";
  }

  async execute({ message, args }) {
    switch (args[0]) {
      case "add": {
        const key = args[1];
        const keyIsValid = await validateKey(message, key);
        // TODO: Handle it directly
        if (!keyIsValid) return;

        gw2api.authenticate(key);
        const tokenInfo = await gw2api.tokeninfo().get(key).catch(() => {
          message.delete();
          message.reply("there is either an issue with the API or your key. Please try again later.");
        });

        try {
          const account = await gw2api.account().get(key);

          await createKey(message, tokenInfo, account, key);
          await message.delete();
          await message.reply("your key has been saved and your message has been deleted for privacy.");
        } catch (error) {
          message.channel.send("There was an issue while trying to save your key. Please contact my author.");
          logger.error("Error in key command, argument add", error);
        }
      }
        break;

      case "delete": {
        await deleteKey(message);
      }
    }
  }
}

module.exports = new Key;
