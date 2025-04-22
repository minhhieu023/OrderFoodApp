const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Retrieve methods
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

  static async findByEmail(email) {
    const [rows] = await pool.query(`
      SELECT id, name, email, role, created_at, updated_at
      FROM users 
      WHERE email = ?
    `, [email]);
    return rows[0] || null;
  }

  // Authentication methods
  static async authenticate(email, password) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    const user = rows[0];
    
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return null;
    }

    // Don't send password back
    delete user.password;
    return user;
  }

  // Create and update methods
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

  // Delete method
  static async delete(id) {
    // Kiểm tra xem user có orders không
    const [orders] = await pool.query(
      'SELECT COUNT(*) as count FROM orders WHERE user_id = ?',
      [id]
    );
    
    if (orders[0].count > 0) {
      throw new Error('Cannot delete user with existing orders');
    }
    
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
  }
}

module.exports = User;