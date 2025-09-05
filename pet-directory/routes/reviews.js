//routes/reviews.js
const express = require('express');
const router = express.Router();
const { createReview, getBusinessReviews, deleteReview } = require('../controllers/reviewController');
const { authenticate } = require('../middlewares/authMiddleware');
const { createReviewValidator, reviewIdValidator } = require('../middlewares/validators/reviewValidator');
const { validate } = require('../middlewares/validators/validateMiddleware');
const { param, query } = require('express-validator');

// Create review
router.post('/', authenticate, createReviewValidator, validate, createReview);

// Get reviews by business with validation and optional pagination
router.get(
  '/:businessId',
  [
    param('businessId').isInt().withMessage('Business ID must be an integer'),
    query('page').optional().isInt({ gt: 0 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ gt: 0 }).withMessage('Limit must be a positive integer')
  ],
  validate,
  getBusinessReviews
);

// Delete review
router.delete('/:id', authenticate, reviewIdValidator, validate, deleteReview);

module.exports = router;
