const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', orderController.getOrderPage);
router.post('/', orderController.createOrder);
router.get('/success/:id', orderController.getOrderSuccess);
router.get('/report', orderController.getDailyReport);
router.get('/detail/:id', orderController.getOrderDetail);
router.get('/edit/:id', orderController.getEditOrderPage);
router.put('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);

module.exports = router; 