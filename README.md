## AureneBot
A Discord Bot, designed to satisfy the needs of a Guild Wars 2 guild.

Features:
 - **Giveaways**: Create a giveaway via user input and pick a random winner
 - **Guides**: Provide useful links and info about a certain raid boss
 - **Missions**: Provide useful links and info about a certain Guild Mission

## Usage
Since the bot isn't public, you need to host it yourself.
You can install the dependencies via ``npm`` or ``yarn``.
After that, you need to set up MongoDB and pass it's URI as environment variable.
The bot relies on environment variables. Either set them on your hosting platform or use the example below to create a ``.env`` file at folder root.

```bash
MONGO_URI=your://mongodb/uri
TOKEN=client_token
OWNER="your_discord_id"
LEADERS=highest_role_id
OFFICERS=officers_role_id
PREFIX=prefix_of_your_choice
GIVEAWAY_CHANNEL=channel_id_for_giveaways
```

Please keep in mind that this bot is currently experimental.
