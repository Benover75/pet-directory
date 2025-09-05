// middlewares/validators/businessValidator.js
const { body, param } = require('express-validator');


exports.createBusinessValidator = [
body('name').trim().notEmpty().withMessage('Business name is required').isLength({ max: 100 }).withMessage('Name too long'),
body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 500 }).withMessage('Description too long'),
body('address').trim().notEmpty().withMessage('Address is required'),
body('phone').trim().notEmpty().withMessage('Phone is required').matches(/^[0-9\-+() ]+$/).withMessage('Invalid phone number'),
body('email').trim().isEmail().withMessage('Invalid email address'),
body('website').optional().isURL().withMessage('Invalid website URL'),
];


exports.businessIdValidator = [
param('id').isInt().withMessage('Business ID must be an integer')
];
