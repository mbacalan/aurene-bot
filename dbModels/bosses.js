module.exports = (sequelize, DataTypes) => {
  return sequelize.define("bosses", {
    name: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    alias: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    wiki: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    video: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    raidIndex: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
};
