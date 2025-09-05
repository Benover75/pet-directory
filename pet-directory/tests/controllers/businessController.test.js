
const request = require('supertest');
const express = require('express');
const businessController = require('../../controllers/businessController');
const { Business } = require('../../models');

jest.mock('../../models');

const app = express();
app.use(express.json());
app.post('/businesses', (req, res, next) => {
  req.user = { id: 1 };
  next();
}, businessController.createBusiness);
app.get('/businesses', businessController.getBusinesses);

describe('Business Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /businesses', () => {
    it('should create a new business successfully', async () => {
      const businessData = { name: 'Test Business', type: 'Vet', address: '123 Main St' };
      const createdBusiness = { id: 1, ...businessData, userId: 1 };
      Business.create.mockResolvedValue(createdBusiness);

      const res = await request(app)
        .post('/businesses')
        .send(businessData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.name).toBe(businessData.name);
    });

    it('should return an error if business creation fails', async () => {
      const businessData = { name: 'Test Business', type: 'Vet', address: '123 Main St' };
      Business.create.mockRejectedValue(new Error('Creation failed'));

      const res = await request(app)
        .post('/businesses')
        .send(businessData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Creation failed');
    });
  });

  describe('GET /businesses', () => {
    it('should get a list of businesses', async () => {
      const businesses = [{ id: 1, name: 'Business 1' }, { id: 2, name: 'Business 2' }];
      Business.findAll.mockResolvedValue(businesses);

      const res = await request(app).get('/businesses');

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(2);
    });

    it('should get a list of businesses with pagination', async () => {
      const businesses = [{ id: 2, name: 'Business 2' }];
      Business.findAll.mockResolvedValue(businesses);

      const res = await request(app).get('/businesses?page=2&limit=1');

      expect(res.statusCode).toEqual(200);
      expect(Business.findAll).toHaveBeenCalledWith({
        where: {},
        limit: 1,
        offset: 1,
      });
    });

    it('should get a list of businesses with search', async () => {
      const businesses = [{ id: 1, name: 'Test Business' }];
      Business.findAll.mockResolvedValue(businesses);

      const res = await request(app).get('/businesses?search=Test');

      expect(res.statusCode).toEqual(200);
      expect(Business.findAll).toHaveBeenCalledWith({
        where: { name: { [require('sequelize').Op.iLike]: '%Test%' } },
        limit: 10,
        offset: 0,
      });
    });
  });
});
