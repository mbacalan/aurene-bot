module.exports = (sequelize, DataTypes) => {
  return sequelize.define("entries", {
    userId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    discriminator: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entryTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
};

