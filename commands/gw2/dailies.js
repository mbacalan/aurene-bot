const { RichEmbed } = require("discord.js");
const { sortAlphabetically } = require("../../utils/general");
const { gw2api } = require("../../utils/api");
const { db } = require("../../utils/db");
const { fractalsData } = require("../../utils/gameData");

class Dailies {
  constructor() {
    this.name = "dailies";
    this.description = "See today's dailies";
  }

  async execute(message) {
    const dailies = await gw2api.achievements().daily().get();
    const DailiesEmbed = new RichEmbed().setTitle("Dailies");
    const categories = ["PvE", "PvP", "WvW", "Fractals"];
    const normFractals = [];
    const recFractals = [];

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i].toLowerCase();

      // Promise.all for async operations while iterating
      const arr = await Promise.all(
        dailies[category].filter((daily) => daily.level.max === 80).map(async (daily) => {
          return await db.collection("gw2.achievements").findOne({ id: daily.id })
            .then((result) => {
              if (category === "fractals") {
                const fractal = result.name.split(/[0-9]/)[1];

                if (result.name.includes("Recommended")) {
                  const tempFractal = result.name.replace("Daily Recommended Fractal—", "Recommended ");

                  // check if a fractal in fractalsData has the scale of rec. fractal inside it's array of values
                  for (const [key, value] of Object.entries(fractalsData)) {
                    const recFractalScale = parseInt(tempFractal.replace(/[^\d.]/g, ""), 10);

                    if (value.includes(recFractalScale)) {
                      recFractals.push(`${tempFractal} - ${key}`);
                    }
                  }
                }

                if (!normFractals.includes(fractal)) {
                  normFractals.push(fractal);
                }
              }

              if (result.name.includes(`Daily ${categories[i]}`)) {
                return result.name.replace(`Daily ${categories[i]}`, "");
              }

              return result.name.replace("Daily", "");
            });
        })
      );

      if (category === "fractals") {
        const dailyFractals = [...normFractals, ...recFractals].sort((a, b) => sortAlphabetically(a, b)).join("\n");
        DailiesEmbed.addField("Fractals", dailyFractals);
      } else {
        const dailyArr = arr.sort((a, b) => sortAlphabetically(a, b)).join("\n");
        DailiesEmbed.addField(categories[i], dailyArr);
      }
    }

    // TODO: Add PSNA
    await message.channel.send(DailiesEmbed).catch(() => {
      message.channel.send("I'm lacking permissions to send an embed!");
    });
  }
}

module.exports = new Dailies;
