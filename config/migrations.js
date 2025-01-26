const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigrations() {
  try {
    // Tạo connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // Kiểm tra xem cột note đã tồn tại chưa
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'order_items' 
      AND COLUMN_NAME = 'note'
    `, [process.env.DB_NAME]);

    // Nếu cột note chưa tồn tại thì thêm vào
    if (columns.length === 0) {
      await connection.query(`
        ALTER TABLE order_items
        ADD COLUMN note TEXT
      `);
      console.log('Added note column to order_items table');
    }

    await connection.end();
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

module.exports = runMigrations; 