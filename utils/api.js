const fetch = require("node-fetch");

async function callApi(endpoint, key) {
  let headers;

  if (key) {
    headers = { Authorization: `Bearer ${key}` };
  }

  try {
    const response = await fetch(`https://api.guildwars2.com/v2/${endpoint}`, {
      method: "GET",
      headers,
    });

    if (response.status >= 200 && response.status < 400) {
      return response.json();
    } else { return; }
  } catch (error) {
    console.log(error);
  }
}

async function getTokenInfo(message, key) {
  const tokenInfo = await callApi("tokeninfo", key);

  if (!tokenInfo) {
    message.delete();
    message.reply("there is either an issue with the API or your key. Please try again later.");
    return;
  }

  return tokenInfo;
}

module.exports = { callApi, getTokenInfo };
