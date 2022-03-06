import { resolve } from "path";
import { config } from "dotenv";

config({ path: resolve(__dirname, "../.env") });

import fs from 'fs';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

const commands = [];
const commandFiles = fs.readdirSync('./slash-commands').filter(file => file.endsWith('.js'));
const gw2commandFiles = fs.readdirSync('./slash-commands/gw2').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./slash-commands/${file}`);
  commands.push(command.data.toJSON());
}

for (const file of gw2commandFiles) {
  const command = require(`./slash-commands/gw2/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands("400644240746479616"),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
