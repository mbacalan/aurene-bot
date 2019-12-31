const { callApi, getTokenInfo } = require("../utils/api");
const { checkKey } = require("../utils/general");
const { createKey } = require("../utils/db");

module.exports = {
  name: "key",
  args: true,
  description: "Add your GW2 API key",
  async execute(message, args) {
    switch (args[0]) {
      case "add": {
        const inputtedKey = args[1];
        const keyIsValid = await checkKey(message, inputtedKey);
        const tokenInfo = await getTokenInfo(message, inputtedKey);

        if (keyIsValid && tokenInfo) {
          const account = await callApi("account", inputtedKey);

          try {
            await createKey(message, tokenInfo, account, inputtedKey);
            await message.delete();
            await message.reply("your key has been saved and your message has been deleted for privacy.");
          } catch (error) {
            console.log(error);
            message.channel.send("There was an issue while trying to save your key. Please contact my author.");
          }
        }
      }
    }
  },
};
