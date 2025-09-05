module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true, len: [1, 50] }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    password: { type: DataTypes.STRING, allowNull: false, validate: { len: [6, 100] } },
    role: { type: DataTypes.ENUM('user', 'business', 'admin'), defaultValue: 'user' }
  }, { tableName: 'users', timestamps: true });

  User.associate = (models) => {
    User.hasMany(models.Business, { foreignKey: 'userId', onDelete: 'CASCADE' });
    User.hasMany(models.Pet, { foreignKey: 'userId', onDelete: 'CASCADE' });
    User.hasMany(models.Review, { foreignKey: 'userId', onDelete: 'CASCADE' });
  };

  return User;
};
