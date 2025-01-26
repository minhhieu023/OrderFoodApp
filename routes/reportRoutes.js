const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/customer', reportController.getCustomerReportPage);
router.get('/customer/search', reportController.getCustomerReport);

module.exports = router; 