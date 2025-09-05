
const request = require('supertest');
const express = require('express');
const authController = require('../../controllers/authController');
jest.mock('../../models');
const { User } = require('../../models');

const app = express();
app.use(express.json());
app.post('/register', authController.register);
app.post('/login', authController.login);

describe('Auth Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      const userData = { name: 'Test User', email: 'test@example.com', password: 'password123', role: 'user' };
      const createdUser = { id: 1, ...userData };
      User.create.mockResolvedValue(createdUser);

      const res = await request(app)
        .post('/register')
        .send(userData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe(userData.email);
    });

    it('should return an error if registration fails', async () => {
      const userData = { name: 'Test User', email: 'test@example.com', password: 'password123', role: 'user' };
      User.create.mockRejectedValue(new Error('Registration failed'));

      const res = await request(app)
        .post('/register')
        .send(userData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Registration failed');
    });
  });

  describe('POST /login', () => {
    it('should login an existing user successfully', async () => {
      const loginData = { email: 'test@example.com', password: 'password123' };
      const existingUser = { id: 1, email: 'test@example.com', password: 'hashedpassword', role: 'user' };
      User.findOne.mockResolvedValue(existingUser);
      
      // Mock bcrypt.compare to return true
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const res = await request(app)
        .post('/login')
        .send(loginData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe(loginData.email);
    });

    it('should return an error for a non-existent user', async () => {
      const loginData = { email: 'nonexistent@example.com', password: 'password123' };
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/login')
        .send(loginData);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'User not found');
    });

    it('should return an error for invalid credentials', async () => {
      const loginData = { email: 'test@example.com', password: 'wrongpassword' };
      const existingUser = { id: 1, email: 'test@example.com', password: 'hashedpassword', role: 'user' };
      User.findOne.mockResolvedValue(existingUser);

      // Mock bcrypt.compare to return false
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const res = await request(app)
        .post('/login')
        .send(loginData);

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });
  });
});
