const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../middlewares/validators/userValidator');
const { validate } = require('../middlewares/validators/validateMiddleware');
const authMiddleware = require('../middlewares/authMiddleware'); // contains authenticate & isAdmin

// User registration & login with validation
router.post('/register', registerValidator, validate, authController.register);
router.post('/login', loginValidator, validate, authController.login);

// Refresh token endpoint
router.post('/refresh', authController.refreshToken);

// Logout (requires valid access token)
router.post('/logout', authMiddleware.authenticate, authController.logout);

module.exports = router;
