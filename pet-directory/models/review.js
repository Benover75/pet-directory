module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
    comment: { type: DataTypes.TEXT, allowNull: false, validate: { notEmpty: true, len: [1, 500] } },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    businessId: { type: DataTypes.INTEGER, allowNull: false },
    serviceId: { type: DataTypes.INTEGER, allowNull: true }
  }, { tableName: 'reviews' });

  Review.associate = (models) => {
    Review.belongsTo(models.User, { foreignKey: 'userId' });
    Review.belongsTo(models.Business, { foreignKey: 'businessId' });
    Review.belongsTo(models.Service, { foreignKey: 'serviceId' });
  };

  return Review;
};
