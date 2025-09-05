// middlewares/validators/reviewValidator.js
const { body, param } = require('express-validator');


exports.createReviewValidator = [
body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
body('comment').trim().notEmpty().withMessage('Comment is required').isLength({ max: 500 }).withMessage('Comment too long'),
body('userId').isInt().withMessage('User ID must be an integer'),
body('businessId').isInt().withMessage('Business ID must be an integer'),
body('serviceId').optional().isInt().withMessage('Service ID must be an integer'),
];


exports.reviewIdValidator = [
param('id').isInt().withMessage('Review ID must be an integer')
];
