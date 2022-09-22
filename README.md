## AureneBot
A Discord bot designed to make managing a Guild Wars 2 guild server fun and easy.

Features:
 - **Giveaways**: Create a giveaway via user input and pick a random winner
 - **Guides**: Provide useful links and info about a given raid boss
 - **Missions**: Provide useful links and info about a given guild mission
 - **Starboard**: Save messages with enough stars to a seperate channel for everyone to see
 - **Poll**: Create a poll directly on Discord with an easy to use syntax
 - **GW2 API**: Add an API key to see your account info, character info or current dailies

## Usage
Since the bot isn't public, you will have to host it yourself.

You need to set up MongoDB and Redis, then pass their URI's as environment variables (see below).

To be able to install all the dependencies, you need to create a `.npmrc` at project root and add in the following:

```bash
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_PERSONAL_ACCESS_TOKEN
@mbacalan:registry=https://npm.pkg.github.com
```

Afterwards:

```bash
# insall dependencies
npm install

# start the bot
npm start
```

Set the environment variables on your hosting platform or use the example below to create a ``.env`` file at folder root.

```bash
MONGO_URI=your://mongodb/ur #mongodb://localhost:27017
REDIS_URL=your://redis/uri #redis://localhost:6379
TOKEN=client_token
OWNER=your_discord_id
LEADERS=highest_role_id
OFFICERS=officers_role_id
GIVEAWAY_CHANNEL=channel_id_for_giveaways
MISSIONS_CHANNEL=channel_id_for_missions
STARBOARD_CHANNEL=channel_id_for_starboarrd
```

Please keep in mind that this bot is currently experimental.
