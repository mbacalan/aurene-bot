module.exports = (sequelize, DataTypes) => {
  return sequelize.define("winners", {
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
    creationTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    item: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
};
