const cron = require('node-cron');
const pool = require('../config/database');
const Invoice = require('../models/Invoice');

// Chạy vào 00:01 ngày đầu tiên của mỗi tháng
const scheduleMonthlyInvoices = () => {
  cron.schedule('1 0 1 * *', async () => {
    console.log('Running monthly invoice generation...');
    
    try {
      // Lấy tháng và năm trước
      const now = new Date();
      const prevMonth = now.getMonth(); // 0-11
      const year = prevMonth === 0 ? now.getFullYear() - 1 : now.getFullYear();
      const month = prevMonth === 0 ? 12 : prevMonth;

      // Lấy danh sách users
      const [users] = await pool.query(
        'SELECT id FROM users WHERE role = ?',
        ['user']
      );

      // Tạo invoice cho từng user
      for (const user of users) {
        try {
          const invoiceId = await Invoice.createInvoice(user.id, month, year);
          if (invoiceId) {
            console.log(`Created invoice ${invoiceId} for user ${user.id}`);
          }
        } catch (error) {
          console.error(`Error creating invoice for user ${user.id}:`, error);
        }
      }

      console.log('Monthly invoice generation completed');
    } catch (error) {
      console.error('Error in monthly invoice generation:', error);
    }
  }, {
    timezone: "Asia/Ho_Chi_Minh"
  });
};

module.exports = { scheduleMonthlyInvoices }; 