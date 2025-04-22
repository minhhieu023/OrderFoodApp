const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login routes
router.get('/login', authController.getLoginPage);
router.post('/login', authController.login);

// Registration routes
router.get('/register', authController.getRegisterPage);
router.post('/register', authController.register);

// Logout route
router.get('/logout', authController.logout);

module.exports = router;