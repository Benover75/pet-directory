
const request = require('supertest');
const express = require('express');
const serviceController = require('../../controllers/serviceController');
const { Service, Business } = require('../../models');

jest.mock('../../models');

const app = express();
app.use(express.json());
app.post('/services', (req, res, next) => {
  req.user = { id: 1 };
  next();
}, serviceController.createService);
app.get('/businesses/:businessId/services', serviceController.getBusinessServices);
app.delete('/services/:id', (req, res, next) => {
  req.user = { id: 1, role: 'user' };
  next();
}, serviceController.deleteService);

describe('Service Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /services', () => {
    it('should create a new service successfully', async () => {
      const serviceData = { businessId: 1, name: 'Grooming', price: 50, duration: 60 };
      Business.findByPk.mockResolvedValue({ id: 1, userId: 1 });
      Service.create.mockResolvedValue({ id: 1, ...serviceData });

      const res = await request(app)
        .post('/services')
        .send(serviceData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.name).toBe(serviceData.name);
    });

    it('should return an error if the business is not found', async () => {
      const serviceData = { businessId: 1, name: 'Grooming', price: 50, duration: 60 };
      Business.findByPk.mockResolvedValue(null);

      const res = await request(app)
        .post('/services')
        .send(serviceData);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'Business not found');
    });

    it('should return an error if the user is not authorized', async () => {
        const serviceData = { businessId: 1, name: 'Grooming', price: 50, duration: 60 };
        Business.findByPk.mockResolvedValue({ id: 1, userId: 2 });
  
        const res = await request(app)
          .post('/services')
          .send(serviceData);
  
        expect(res.statusCode).toEqual(403);
        expect(res.body).toHaveProperty('error', 'Unauthorized');
      });
  });

  describe('GET /businesses/:businessId/services', () => {
    it('should get a list of services for a business', async () => {
      const services = [{ id: 1, name: 'Service 1' }, { id: 2, name: 'Service 2' }];
      Service.findAll.mockResolvedValue(services);

      const res = await request(app).get('/businesses/1/services');

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(2);
    });
  });

  describe('DELETE /services/:id', () => {
    it('should delete a service successfully', async () => {
      const service = { id: 1, businessId: 1 };
      Service.findByPk.mockResolvedValue(service);
      Business.findByPk.mockResolvedValue({ id: 1, userId: 1 });
      Service.destroy.mockResolvedValue(1);

      const res = await request(app).delete('/services/1');

      expect(res.statusCode).toEqual(200);
      expect(Service.destroy).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should return an error if the service is not found', async () => {
      Service.findByPk.mockResolvedValue(null);

      const res = await request(app).delete('/services/1');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'Service not found');
    });

    it('should return an error if the user is not authorized', async () => {
        const service = { id: 1, businessId: 1, destroy: jest.fn() };
        Service.findByPk.mockResolvedValue(service);
        Business.findByPk.mockResolvedValue({ id: 1, userId: 2 });
  
        const res = await request(app).delete('/services/1');
  
        expect(res.statusCode).toEqual(403);
        expect(res.body).toHaveProperty('error', 'Unauthorized');
      });
  });
});
