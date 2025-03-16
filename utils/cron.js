const cron = require('node-cron');
const Invoice = require('../models/Invoice');

// Run at 00:00:01 on day-of-month 1
cron.schedule('1 0 1 * *', async () => {
  try {
    console.log('Generating monthly invoices...');
    await Invoice.generateMonthlyInvoices();
    console.log('Monthly invoices generated successfully');
  } catch (error) {
    console.error('Error generating monthly invoices:', error);
  }
}); 