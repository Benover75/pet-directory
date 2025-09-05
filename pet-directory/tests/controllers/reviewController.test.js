
const request = require('supertest');
const express = require('express');
const reviewController = require('../../controllers/reviewController');
const { Review, Business } = require('../../models');

jest.mock('../../models');

const app = express();
app.use(express.json());
app.post('/reviews', (req, res, next) => {
  req.user = { id: 1 };
  next();
}, reviewController.createReview);
app.get('/businesses/:businessId/reviews', reviewController.getBusinessReviews);
app.delete('/reviews/:id', (req, res, next) => {
  req.user = { id: 1, role: 'user' };
  next();
}, reviewController.deleteReview);

describe('Review Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /reviews', () => {
    it('should create a new review successfully', async () => {
      const reviewData = { businessId: 1, rating: 5, comment: 'Great place!' };
      Business.findByPk.mockResolvedValue({ id: 1 });
      Review.create.mockResolvedValue({ id: 1, ...reviewData, userId: 1 });

      const res = await request(app)
        .post('/reviews')
        .send(reviewData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.comment).toBe(reviewData.comment);
    });

    it('should return an error if the business is not found', async () => {
      const reviewData = { businessId: 1, rating: 5, comment: 'Great place!' };
      Business.findByPk.mockResolvedValue(null);

      const res = await request(app)
        .post('/reviews')
        .send(reviewData);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'Business not found');
    });
  });

  describe('GET /businesses/:businessId/reviews', () => {
    it('should get a list of reviews for a business', async () => {
      const reviews = [{ id: 1, comment: 'Review 1' }, { id: 2, comment: 'Review 2' }];
      Review.findAll.mockResolvedValue(reviews);

      const res = await request(app).get('/businesses/1/reviews');

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(2);
    });
  });

  describe('DELETE /reviews/:id', () => {
    it('should delete a review successfully', async () => {
      const review = { id: 1, userId: 1, destroy: jest.fn() };
      Review.findByPk.mockResolvedValue(review);

      const res = await request(app).delete('/reviews/1');

      expect(res.statusCode).toEqual(200);
      expect(review.destroy).toHaveBeenCalled();
    });

    it('should return an error if the review is not found', async () => {
      Review.findByPk.mockResolvedValue(null);

      const res = await request(app).delete('/reviews/1');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'Review not found');
    });

    it('should return an error if the user is not authorized', async () => {
      const review = { id: 1, userId: 2, destroy: jest.fn() };
      Review.findByPk.mockResolvedValue(review);

      const res = await request(app).delete('/reviews/1');

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('error', 'Unauthorized');
    });
  });
});
