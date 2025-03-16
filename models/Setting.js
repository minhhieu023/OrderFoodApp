const pool = require('../config/database');

class Setting {
  static async getOrderStatus() {
    const [rows] = await pool.query(
      'SELECT status FROM settings WHERE name = ?',
      ['order_status']
    );
    return rows[0]?.status ?? true;
  }

  static async setOrderStatus(status) {
    await pool.query(
      'UPDATE settings SET status = ? WHERE name = ?',
      [status, 'order_status']
    );
  }

  static async getNotificationTime() {
    const [rows] = await pool.query(
      'SELECT value FROM settings WHERE name = ?',
      ['notification_time']
    );
    return rows[0]?.value ?? '11:00';
  }

  static async setNotificationTime(time) {
    await pool.query(
      'UPDATE settings SET value = ? WHERE name = ?',
      [time, 'notification_time']
    );
  }

  static async getNotificationContent() {
    const [rows] = await pool.query(
      'SELECT value FROM settings WHERE name = ?',
      ['notification_content']
    );
    return rows[0]?.value ? JSON.parse(rows[0].value) : {
      title: 'Food Order Reminder',
      body: "It's time to order your lunch!"
    };
  }

  static async setNotificationContent(content) {
    await pool.query(
      'UPDATE settings SET value = ? WHERE name = ?',
      [JSON.stringify(content), 'notification_content']
    );
  }
}

module.exports = Setting; 