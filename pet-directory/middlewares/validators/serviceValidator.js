// middlewares/validators/serviceValidator.js
const { body, param } = require('express-validator');


exports.createServiceValidator = [
body('name').trim().notEmpty().withMessage('Service name is required').isLength({ max: 100 }).withMessage('Name too long'),
body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 500 }).withMessage('Description too long'),
body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
body('duration').isInt({ gt: 0 }).withMessage('Duration must be a positive integer'),
body('businessId').isInt().withMessage('Business ID must be an integer'),
];


exports.serviceIdValidator = [
param('id').isInt().withMessage('Service ID must be an integer')
];
