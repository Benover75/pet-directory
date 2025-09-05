module.exports = (sequelize, DataTypes) => {
  const Business = sequelize.define('Business', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true, len: [1, 100] } },
    type: { type: DataTypes.ENUM('Vet', 'Groomer', 'Pet Sitter', 'Dog Park'), allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    latitude: { type: DataTypes.DECIMAL },
    longitude: { type: DataTypes.DECIMAL },
    contactInfo: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    userId: { type: DataTypes.INTEGER, allowNull: false }
  }, { tableName: 'businesses' });

  Business.associate = (models) => {
    Business.belongsTo(models.User, { foreignKey: 'userId' });
    Business.hasMany(models.Service, { foreignKey: 'businessId' });
    Business.hasMany(models.Review, { foreignKey: 'businessId' });
  };

  return Business;
};

