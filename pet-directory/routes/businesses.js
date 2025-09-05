//routes/businesses.js
const express = require('express');
const router = express.Router();
const { createBusiness, getBusinesses } = require('../controllers/businessController');
const { authenticate } = require('../middlewares/authMiddleware');
const { createBusinessValidator, businessIdValidator } = require('../middlewares/validators/businessValidator');
const { validate } = require('../middlewares/validators/validateMiddleware');
const { query, param } = require('express-validator');

// Create business
router.post('/', authenticate, createBusinessValidator, validate, createBusiness);

// Get all businesses with optional query validation (pagination, filtering)
router.get(
  '/',
  [
    query('page').optional().isInt({ gt: 0 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ gt: 0 }).withMessage('Limit must be a positive integer'),
    query('search').optional().isString().withMessage('Search must be a string')
  ],
  validate,
  getBusinesses
);

module.exports = router;
