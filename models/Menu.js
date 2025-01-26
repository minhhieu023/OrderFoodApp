const pool = require('../config/database');

class Menu {
  static async getAll() {
    const [rows] = await pool.query('SELECT * FROM menu');
    return rows;
  }

  static async add(name, price) {
    const [result] = await pool.query(
      'INSERT INTO menu (name, price) VALUES (?, ?)',
      [name, price]
    );
    return result.insertId;
  }

  static async update(id, name, price) {
    if (!id || !name || price === undefined) {
      throw new Error('Missing required fields');
    }
    if (price < 0) {
      throw new Error('Price cannot be negative');
    }
    await pool.query(
      'UPDATE menu SET name = ?, price = ? WHERE id = ?',
      [name, price, id]
    );
  }

  static async delete(id) {
    await pool.query('DELETE FROM menu WHERE id = ?', [id]);
  }
}

module.exports = Menu; 