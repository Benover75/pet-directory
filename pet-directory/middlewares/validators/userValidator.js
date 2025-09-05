// middlewares/validators/userValidator.js
const { body, param } = require('express-validator');


exports.registerValidator = [
body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name too long'),
body('email').trim().isEmail().withMessage('Invalid email address'),
body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];


exports.loginValidator = [
body('email').trim().isEmail().withMessage('Invalid email address'),
body('password').notEmpty().withMessage('Password is required'),
];


exports.userIdValidator = [
param('id').isInt().withMessage('User ID must be an integer')
];
