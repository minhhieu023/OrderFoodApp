const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { adminMiddleware, orderMiddleware, orderActionMiddleware } = require('../middleware/auth');

router.get('/', orderController.getOrders);
router.post('/', orderMiddleware, orderController.createOrder);
router.post('/toggle-status', adminMiddleware, orderController.toggleOrderStatus);
router.get('/success/:id', orderController.getOrderSuccess);
router.get('/report', orderController.getDailyReport);
router.get('/detail/:id', orderController.getOrderDetail);
router.get('/edit/:id', orderController.getEditOrderPage);
router.put('/:id', orderActionMiddleware, orderController.updateOrder);
router.delete('/:id', orderActionMiddleware, orderController.deleteOrder);

module.exports = router; 