const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Admin routes
router.get('/admin/list', adminMiddleware, invoiceController.getAllInvoices);
router.post('/admin/create', adminMiddleware, invoiceController.createInvoice);
router.post('/admin/generate-monthly', adminMiddleware, invoiceController.generateMonthlyInvoices);
router.put('/admin/:id/status', adminMiddleware, invoiceController.updateInvoiceStatus);
router.post('/admin/:id/note', adminMiddleware, invoiceController.addInvoiceNote);

// User routes
router.get('/', invoiceController.getUserInvoices);
router.get('/:id', invoiceController.getInvoiceDetail);
router.post('/:id/mark-transferred', invoiceController.markAsTransferred);

module.exports = router; 