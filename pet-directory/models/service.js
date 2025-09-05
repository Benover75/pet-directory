module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define('Service', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true, len: [1, 100] } },
    price: { type: DataTypes.DECIMAL, validate: { min: 0 } },
    duration: { type: DataTypes.INTEGER, validate: { min: 1 } },
    businessId: { type: DataTypes.INTEGER, allowNull: false }
  }, { tableName: 'services' });

  Service.associate = (models) => {
    Service.belongsTo(models.Business, { foreignKey: 'businessId' });
  };

  return Service;
};

