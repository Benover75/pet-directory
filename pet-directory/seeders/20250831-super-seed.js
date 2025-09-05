'use strict';
const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Arrays to store IDs for associations
    const userIds = [];
    const businessIds = [];
    const serviceIds = [];
    const petIds = [];

    // 1️⃣ Create Users
    const users = [];
    const passwordHash = await bcrypt.hash('Password123!', 12);
    for (let i = 1; i <= 10; i++) {
      users.push({
        name: faker.person.fullName(),
        email: `user${i}@petdirectory.com`,
        password: passwordHash,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const insertedUsers = await queryInterface.bulkInsert('users', users, { returning: true });
    insertedUsers.forEach(u => userIds.push(u.id));

    // 2️⃣ Create Businesses
    const businesses = [];
    for (let i = 0; i < 5; i++) {
      const ownerId = userIds[i % userIds.length]; // assign owner
      businesses.push({
        name: faker.company.name(),
        type: faker.helpers.arrayElement(['Vet', 'Groomer', 'Pet Sitter', 'Dog Park']),
        address: faker.location.streetAddress(),
        latitude: faker.location.latitude(),
        longitude: faker.location.longitude(),
        contactInfo: faker.phone.number(),
        description: faker.lorem.sentence(),
        userId: ownerId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    const insertedBusinesses = await queryInterface.bulkInsert('businesses', businesses, { returning: true });
    insertedBusinesses.forEach(b => businessIds.push(b.id));

    // 3️⃣ Create Services
    const services = [];
    for (const bizId of businessIds) {
      for (let j = 0; j < 3; j++) {
        services.push({
          name: faker.commerce.productName(),
          price: faker.number.int({ min: 20, max: 200 }),
          duration: faker.number.int({ min: 30, max: 120 }),
          businessId: bizId,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    const insertedServices = await queryInterface.bulkInsert('services', services, { returning: true });
    insertedServices.forEach(s => serviceIds.push(s.id));

    // 4️⃣ Create Pets
    const pets = [];
    for (const uid of userIds) {
      for (let k = 0; k < 2; k++) {
        pets.push({
          name: faker.person.firstName(),
          type: faker.helpers.arrayElement(['Dog', 'Cat', 'Exotic']),
          breed: faker.animal.type(),
          age: faker.number.int({ min: 1, max: 15 }),
          userId: uid,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    const insertedPets = await queryInterface.bulkInsert('pets', pets, { returning: true });
    insertedPets.forEach(p => petIds.push(p.id));

    // 5️⃣ Create Reviews
    const reviews = [];
    for (let i = 0; i < 20; i++) {
      const userId = faker.helpers.arrayElement(userIds);
      const businessId = faker.helpers.arrayElement(businessIds);
      const serviceId = faker.helpers.arrayElement(serviceIds);
      reviews.push({
        rating: faker.number.int({ min: 1, max: 5 }),
        comment: faker.lorem.sentence(),
        userId,
        businessId,
        serviceId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await queryInterface.bulkInsert('reviews', reviews);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('reviews', null, {});
    await queryInterface.bulkDelete('pets', null, {});
    await queryInterface.bulkDelete('services', null, {});
    await queryInterface.bulkDelete('businesses', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
