const pool = require('../config/database');
const qr = require('qrcode');

class Invoice {
  static async generateMonthlyInvoices() {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Get previous month and year
      const today = new Date();
      const prevMonth = today.getMonth(); // 0-11
      const year = prevMonth === 0 ? today.getFullYear() - 1 : today.getFullYear();
      const month = prevMonth === 0 ? 12 : prevMonth;

      // Get all users
      const [users] = await connection.query('SELECT id FROM users');

      for (const user of users) {
        // Get total orders for previous month
        const [orders] = await connection.query(
          `SELECT o.id, o.total 
           FROM orders o 
           WHERE o.user_id = ? 
           AND MONTH(o.date) = ? 
           AND YEAR(o.date) = ?`,
          [user.id, month, year]
        );

        if (orders.length > 0) {
          const totalAmount = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
          
          // Generate invoice ID: INV-YYYYMM-USERID
          const invoiceId = `INV-${year}${month.toString().padStart(2, '0')}-${user.id}`;

          // Create invoice
          await connection.query(
            'INSERT INTO invoices (id, user_id, month, year, total_amount) VALUES (?, ?, ?, ?, ?)',
            [invoiceId, user.id, month, year, totalAmount]
          );

          // Add invoice items
          for (const order of orders) {
            await connection.query(
              'INSERT INTO invoice_items (invoice_id, order_id, amount) VALUES (?, ?, ?)',
              [invoiceId, order.id, order.total]
            );
          }
        }
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getUserInvoices(userId) {
    const [rows] = await pool.query(
      `SELECT i.*, 
       COUNT(DISTINCT ii.order_id) as order_count,
       u.name as user_name,
       u.email as user_email
       FROM invoices i
       JOIN users u ON i.user_id = u.id
       JOIN invoice_items ii ON i.id = ii.invoice_id
       WHERE i.user_id = ?
       GROUP BY i.id
       ORDER BY i.created_at DESC`,
      [userId]
    );
    return rows;
  }

  static async getInvoiceById(invoiceId) {
    const [rows] = await pool.query(
      `SELECT i.*, 
        u.name as user_name,
        u.email as user_email,
        o.id as order_id,
        o.date as order_date,
        ii.amount,
        (
          SELECT GROUP_CONCAT(
            CONCAT(oi.quantity, 'x ', m.name)
            SEPARATOR ', '
          )
          FROM order_items oi
          JOIN menu m ON oi.menu_id = m.id
          WHERE oi.order_id = o.id
        ) as items
        FROM invoices i
        JOIN users u ON i.user_id = u.id
        JOIN invoice_items ii ON i.id = ii.invoice_id
        JOIN orders o ON ii.order_id = o.id
        WHERE i.id = ?`,
      [invoiceId]
    );
    
    // Format data
    if (rows.length > 0) {
      const invoice = {
        ...rows[0],
        orders: rows.map(row => ({
          order_id: row.order_id,
          order_date: row.order_date,
          amount: row.amount,
          items: row.items
        }))
      };
      // Remove redundant fields
      delete invoice.order_id;
      delete invoice.order_date;
      delete invoice.amount;
      delete invoice.items;
      return invoice;
    }
    return null;
  }

  static async generateQRCode(invoiceId) {
    const bankId = '970418'; // BIDV bank ID
    const accountNo = '3142336054';
    const template = 'compact2'; // hoặc có thể dùng: compact, compact2, qr_only
    
    // Lấy thông tin invoice để có amount
    const [invoice] = await pool.query(
      'SELECT total_amount FROM invoices WHERE id = ?',
      [invoiceId]
    );
    
    if (!invoice[0]) {
      throw new Error('Invoice not found');
    }
    
    const amount = Math.round(invoice[0].total_amount);
    const accountName = 'NGUYEN HOANG GIA'; // Tên chủ tài khoản
    
    const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png` +
                  `?amount=${amount}` +
                  `&addInfo=${invoiceId}` +
                  `&accountName=${encodeURIComponent(accountName)}`;
                  
    return qrUrl;
  }

  static async updateStatus(invoiceId, status, note = null) {
    // Validate status
    const validStatuses = ['new', 'transferred', 'confirmed', 'cancelled', 'not_received'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    await pool.query(
      'UPDATE invoices SET status = ?, paid_at = ?, note = ? WHERE id = ?',
      [
        status,
        status === 'confirmed' ? new Date() : null,
        note,
        invoiceId
      ]
    );
  }

  static async updateNote(invoiceId, note) {
    await pool.query(
      'UPDATE invoices SET note = ? WHERE id = ?',
      [note, invoiceId]
    );
  }

  static async getAllInvoices() {
    const [rows] = await pool.query(
      `SELECT i.*, 
       COUNT(DISTINCT ii.order_id) as order_count,
       u.name as user_name,
       u.email as user_email
       FROM invoices i
       JOIN users u ON i.user_id = u.id
       JOIN invoice_items ii ON i.id = ii.invoice_id
       GROUP BY i.id
       ORDER BY i.created_at DESC`
    );
    return rows;
  }

  static async createInvoice(userId, month, year) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Get orders for specified month
      const [orders] = await connection.query(
        `SELECT o.id, o.total 
         FROM orders o 
         WHERE o.user_id = ? 
         AND MONTH(o.date) = ? 
         AND YEAR(o.date) = ?`,
        [userId, month, year]
      );

      if (orders.length > 0) {
        const totalAmount = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
        
        // Generate invoice ID: INV-YYYYMM-USERID
        const invoiceId = `INV-${year}${month.toString().padStart(2, '0')}-${userId}`;

        // Create invoice
        await connection.query(
          'INSERT INTO invoices (id, user_id, month, year, total_amount) VALUES (?, ?, ?, ?, ?)',
          [invoiceId, userId, month, year, totalAmount]
        );

        // Add invoice items
        for (const order of orders) {
          await connection.query(
            'INSERT INTO invoice_items (invoice_id, order_id, amount) VALUES (?, ?, ?)',
            [invoiceId, order.id, order.total]
          );
        }

        await connection.commit();
        return invoiceId;
      }
      return null;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async generateMonthlyInvoices(month, year) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Lấy danh sách users
      const [users] = await connection.query(
        'SELECT id FROM users WHERE role = ?',
        ['user']
      );

      const results = [];
      // Tạo invoice cho từng user
      for (const user of users) {
        try {
          const invoiceId = await Invoice.createInvoice(user.id, month, year);
          if (invoiceId) {
            results.push({ userId: user.id, invoiceId, success: true });
          } else {
            results.push({ userId: user.id, success: false, error: 'No orders found' });
          }
        } catch (error) {
          results.push({ userId: user.id, success: false, error: error.message });
        }
      }

      await connection.commit();
      return results;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Invoice; 