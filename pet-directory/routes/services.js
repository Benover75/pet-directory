//routes/services.js
const express = require('express');
const router = express.Router();
const { createService, getBusinessServices, deleteService } = require('../controllers/serviceController');
const { authenticate } = require('../middlewares/authMiddleware');
const { createServiceValidator, serviceIdValidator } = require('../middlewares/validators/serviceValidator');
const { validate } = require('../middlewares/validators/validateMiddleware');
const { param, query } = require('express-validator');

// Create service
router.post('/', authenticate, createServiceValidator, validate, createService);

// Get services by business with validation for businessId and optional pagination
router.get(
  '/:businessId',
  [
    param('businessId').isInt().withMessage('Business ID must be an integer'),
    query('page').optional().isInt({ gt: 0 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ gt: 0 }).withMessage('Limit must be a positive integer')
  ],
  validate,
  getBusinessServices
);

// Delete service
router.delete('/:id', authenticate, serviceIdValidator, validate, deleteService);

module.exports = router;
