const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { adminMiddleware } = require('../middleware/auth');

// Apply admin middleware to all user routes
router.use(adminMiddleware);

router.get('/', userController.getAllUsers);
router.post('/', userController.addUser);  
router.put('/:id', userController.updateUser);
router.post('/:id/reset-password', userController.resetPassword);
router.delete('/:id', userController.deleteUser);
router.post('/settings/notification-time', userController.setNotificationTime);
router.get('/settings/notification-time', userController.getNotificationTime);
router.post('/settings/notification-content', userController.setNotificationContent);
router.get('/settings/notification-content', userController.getNotificationContent);
router.get('/list', userController.getUsersList);

module.exports = router;