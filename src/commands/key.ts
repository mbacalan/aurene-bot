import { Keys } from "../models";
import { Command, CommandParams } from "../types";
import { gw2api, logger, validateKey } from "../utils";

class Key implements Command {
  name = "key";
  args = true;
  description = "Add your GW2 API key";
  usage = "add/delete";

  async execute({ message, args }: CommandParams) {
    switch (args[0]) {
      case "add": {
        const key = args[1];
        const keyIsValid = await validateKey(message, key);
        // TODO: Handle it directly
        if (!keyIsValid) return;

        gw2api.authenticate(key);
        const tokenInfo = await gw2api.tokeninfo().get(key).catch(() => {
          message.delete();
          message.reply("There is either an issue with the API or your key. Please try again later.");
        });

        try {
          const account = await gw2api.account().get(key);

          await Keys.create({
            discordId: message.author.id,
            keyName: tokenInfo.name ? tokenInfo.name : "",
            accountName: account.name,
            permissions: tokenInfo.permissions,
            key,
          });

          await message.delete();
          await message.channel.send("Your key has been saved and your message has been deleted for privacy.");
        } catch (error) {
          message.reply("There was an issue while trying to save your key. Please contact my author.");
          logger.error("Error in key command, argument add", error);
        }
      }
        break;

      case "delete": {
        const { key } = await Keys.findOne({ discordId: message.author.id });

        if (!key) {
          return message.reply("Couldn't find a key you added to delete!");
        }

        try {
          await Keys.deleteOne({ key });
          message.reply("Your key has been deleted!");
        } catch (error) {
          message.reply("There was an error with removing your key. Please contact my author");
          logger.error("Error while deleting key", error);
        }
      }
    }
  }
}

export = new Key();
