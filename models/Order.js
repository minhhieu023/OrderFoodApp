const pool = require('../config/database');

class Order {
  static async create(userId, items, total) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Create order
      const [result] = await connection.query(
        'INSERT INTO orders (user_id, total) VALUES (?, ?)',
        [userId, total]
      );
      const orderId = result.insertId;

      // Thêm các món ăn vào order
      for (const item of items) {
        await connection.query(
          'INSERT INTO order_items (order_id, menu_id, quantity, price, note) VALUES (?, ?, ?, ?, ?)',
          [orderId, item.id, item.quantity, item.price, item.note || null]
        );
      }

      await connection.commit();
      return orderId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getDailyReport(date) {
    const [rows] = await pool.query(
      `SELECT o.*, o.user_id, u.name as userName, 
       GROUP_CONCAT(
         CONCAT(
           oi.quantity,
           'x ',
           m.name,
           CASE 
             WHEN oi.note IS NOT NULL AND oi.note != '' 
             THEN CONCAT(' - ', oi.note)
             ELSE ''
           END
         ) 
         SEPARATOR '<br>'
       ) as items
       FROM orders o
       JOIN users u ON o.user_id = u.id
       JOIN order_items oi ON o.id = oi.order_id
       JOIN menu m ON oi.menu_id = m.id
       WHERE DATE(o.date) = DATE(?)
       GROUP BY o.id`,
      [date]
    );
    return rows;
  }

  static async getOrderDetail(orderId) {
    const [rows] = await pool.query(
      `SELECT 
        o.id as orderId,
        o.date,
        o.total as orderTotal,
        u.name as customerName,
        m.name as itemName,
        oi.quantity,
        oi.price as itemPrice,
        oi.note,
        (oi.quantity * oi.price) as itemTotal
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN menu m ON oi.menu_id = m.id
      WHERE o.id = ?`,
      [orderId]
    );
    return rows;
  }

  static async getCustomerReport(customerId, startDate, endDate) {
    const [rows] = await pool.query(
      `SELECT 
        DATE(o.date) as orderDate,
        GROUP_CONCAT(
          CONCAT(
            oi.quantity,
            'x ',
            m.name,
            CASE 
              WHEN oi.note IS NOT NULL AND oi.note != '' 
              THEN CONCAT(' - ', oi.note)
              ELSE ''
            END
          ) 
          SEPARATOR '<br>'
        ) as items,
        o.total as orderTotal
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN menu m ON oi.menu_id = m.id
      WHERE o.user_id = ? 
      AND DATE(o.date) BETWEEN DATE(?) AND DATE(?)
      GROUP BY o.id, DATE(o.date)
      ORDER BY o.date ASC`,
      [customerId, startDate, endDate]
    );
    return rows;
  }

  static async getCustomers() {
    const [rows] = await pool.query(
      `SELECT DISTINCT u.id, u.name
      FROM users u
      ORDER BY u.name ASC`
    );
    return rows;
  }

  static async getOrderById(orderId) {
    const [rows] = await pool.query(
      `SELECT o.*, u.name as userName,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'menu_id', oi.menu_id,
            'itemName', m.name,
            'itemPrice', oi.price,
            'quantity', oi.quantity,
            'note', oi.note
          )
        ) as items
        FROM orders o
        JOIN users u ON o.user_id = u.id
        JOIN order_items oi ON o.id = oi.order_id
        JOIN menu m ON oi.menu_id = m.id
        WHERE o.id = ?
        GROUP BY o.id`,
      [orderId]
    );
    return rows[0];
  }

  static async updateOrder(orderId, items, total) {
    // If no items, delete the order
    if (!items || items.length === 0) {
      await this.deleteOrder(orderId);
      return;
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Update order
      await connection.query(
        'UPDATE orders SET total = ? WHERE id = ?',
        [total, orderId]
      );

      // Delete old items
      await connection.query(
        'DELETE FROM order_items WHERE order_id = ?',
        [orderId]
      );

      // Insert new items
      for (const item of items) {
        await connection.query(
          'INSERT INTO order_items (order_id, menu_id, quantity, note, price) VALUES (?, ?, ?, ?, ?)',
          [orderId, item.id, item.quantity, item.note, item.price]
        );
      }

      await connection.commit();
      return orderId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async deleteOrder(orderId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Delete order items first (foreign key constraint)
      await connection.query(
        'DELETE FROM order_items WHERE order_id = ?',
        [orderId]
      );

      // Delete order
      await connection.query(
        'DELETE FROM orders WHERE id = ?',
        [orderId]
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Order;