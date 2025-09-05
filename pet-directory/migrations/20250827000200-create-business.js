'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('businesses', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      type: { type: Sequelize.ENUM('Vet','Groomer','Pet Sitter','Dog Park'), allowNull: false },
      address: { type: Sequelize.STRING, allowNull: false },
      latitude: { type: Sequelize.DECIMAL },
      longitude: { type: Sequelize.DECIMAL },
      contactInfo: { type: Sequelize.STRING },
      description: { type: Sequelize.TEXT },
      userId: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('businesses');
  }
};
