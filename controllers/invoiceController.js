const Invoice = require('../models/Invoice');

exports.getUserInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.getUserInvoices(req.user.id);
    res.render('invoices/list', { invoices });
  } catch (error) {
    console.error('Error getting user invoices:', error);
    res.status(500).send('Server error');
  }
};

exports.getInvoiceDetail = async (req, res) => {
  try {
    const invoice = await Invoice.getInvoiceById(req.params.id);
    
    if (!invoice) {
      return res.status(404).send('Invoice not found');
    }

    // Check if user owns this invoice or is admin
    if (invoice.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).send('Access denied');
    }

    const qrCode = await Invoice.generateQRCode(invoice.id);
    res.render('invoices/detail', { invoice, qrCode, req });
  } catch (error) {
    console.error('Error getting invoice detail:', error);
    res.status(500).send('Server error');
  }
};

exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.getAllInvoices();
    res.render('invoices/admin/list', { invoices });
  } catch (error) {
    console.error('Error getting all invoices:', error);
    res.status(500).send('Server error');
  }
};

exports.createInvoice = async (req, res) => {
  try {
    const { userId, month, year } = req.body;
    const invoiceId = await Invoice.createInvoice(userId, month, year);
    
    if (!invoiceId) {
      return res.status(400).json({ 
        success: false, 
        error: 'No orders found for this period' 
      });
    }

    res.json({ success: true, invoiceId });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    await Invoice.updateStatus(req.params.id, status, note);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating invoice status:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.addInvoiceNote = async (req, res) => {
  try {
    const { note } = req.body;
    await Invoice.updateNote(req.params.id, note);
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding invoice note:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.markAsTransferred = async (req, res) => {
  try {
    const invoice = await Invoice.getInvoiceById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    // Check if user owns this invoice
    if (invoice.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Only allow marking as transferred if invoice is new or not_received
    if (!['new', 'not_received'].includes(invoice.status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invoice cannot be marked as transferred in current status' 
      });
    }

    await Invoice.updateStatus(req.params.id, 'transferred');
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking invoice as transferred:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.generateMonthlyInvoices = async (req, res) => {
  try {
    const { month, year } = req.body;
    
    if (!month || !year) {
      return res.status(400).json({ 
        success: false, 
        error: 'Month and year are required' 
      });
    }

    const results = await Invoice.generateMonthlyInvoices(month, year);
    res.json({ success: true, results });
  } catch (error) {
    console.error('Error generating monthly invoices:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}; 