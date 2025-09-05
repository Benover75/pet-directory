module.exports = (sequelize, DataTypes) => {
  const Pet = sequelize.define('Pet', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    type: { type: DataTypes.STRING, allowNull: false },
    age: { type: DataTypes.INTEGER },
    breed: { type: DataTypes.STRING },
    userId: { type: DataTypes.INTEGER, allowNull: false }
  }, { tableName: 'pets' });

  Pet.associate = (models) => {
    Pet.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Pet;
};

