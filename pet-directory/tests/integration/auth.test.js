const request = require('supertest');
const express = require('express'); // Import express
const authRoutes = require('../../routes/auth');
const { sequelize } = require('../../config/db'); // Import sequelize from db.js

const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRoutes); // Use the authRoutes directly

describe('Authentication Integration Tests', () => {
  beforeAll(async () => {
    // Sync database and run migrations/seeders
    await sequelize.sync({ force: true });
    // You might want to run seeders here if you have any
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('should login an existing user', async () => {
    // First, register a user to ensure one exists
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Another User',
        email: 'another@example.com',
        password: 'password123',
        role: 'user',
      });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'another@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('another@example.com');
  });
});