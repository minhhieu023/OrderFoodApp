const cron = require('node-cron');
const Invoice = require('../models/Invoice');
const pool = require('../config/database');

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

// Run at 00:00:00 (midnight) GMT+7 every day
cron.schedule('0 17 * * *', async () => {
  try {
    console.log('Enabling order status in settings...');
    const connection = await pool.getConnection();
    await connection.query('UPDATE settings SET status = TRUE WHERE name = ?', ['order_status']);
    connection.release();
    console.log('Order status in settings enabled successfully');
  } catch (error) {
    console.error('Error enabling order status in settings:', error);
  }
}, {
  scheduled: true,
  timezone: "Asia/Bangkok"
});