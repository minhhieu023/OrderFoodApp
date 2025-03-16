const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async getAll() {
    const [rows] = await pool.query(`
      SELECT id, name, email, role, created_at, updated_at 
      FROM users 
      ORDER BY name ASC
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query(`
      SELECT id, name, email, role, created_at, updated_at
      FROM users 
      WHERE id = ?
    `, [id]);
    return rows[0] || null;
  }

  static async create(name, email, password, role = 'user') {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );
    return result.insertId;
  }

  static async update(id, name, email, role) {
    await pool.query(
      'UPDATE users SET name = ?, email = ?, role = ?, updated_at = NOW() WHERE id = ?',
      [name, email, role, id]
    );
  }

  static async updatePassword(id, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, id]
    );
  }

  static async delete(id) {
    // Kiểm tra xem user có orders không
    const [orders] = await pool.query(
      'SELECT COUNT(*) as orderCount FROM orders WHERE user_id = ?', 
      [id]
    );
    
    if (orders[0].orderCount > 0) {
      throw new Error('Cannot delete user with existing orders');
    }
    
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
  }

  static async authenticate(email, password) {
    const [users] = await pool.query(
      'SELECT id, name, email, password, role FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return null;
    }
    
    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    
    if (!match) {
      return null;
    }
    
    // Remove password from result
    delete user.password;
    return user;
  }

  static async updateProfile(id, name, password = null) {
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE users SET name = ?, password = ?, updated_at = NOW() WHERE id = ?',
        [name, hashedPassword, id]
      );
    } else {
      await pool.query(
        'UPDATE users SET name = ?, updated_at = NOW() WHERE id = ?',
        [name, id]
      );
    }
  }
}

module.exports = User; 