const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
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

    // Kiểm tra và thêm các cột mới cho bảng users
    const [userColumns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'users'
    `, [process.env.DB_NAME]);

    const existingColumns = userColumns.map(col => col.COLUMN_NAME);

    // Thêm cột email nếu chưa tồn tại
    if (!existingColumns.includes('email')) {
      await connection.query(`
        ALTER TABLE users
        ADD COLUMN email VARCHAR(255) UNIQUE NOT NULL DEFAULT 'temp@email.com'
      `);
      console.log('Added email column to users table');
    }

    // Thêm cột password nếu chưa tồn tại
    if (!existingColumns.includes('password')) {
      await connection.query(`
        ALTER TABLE users
        ADD COLUMN password VARCHAR(255)
      `);
      console.log('Added password column to users table');
    }

    // Thêm các cột timestamp nếu chưa tồn tại
    if (!existingColumns.includes('created_at')) {
      await connection.query(`
        ALTER TABLE users
        ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('Added created_at column to users table');
    }

    if (!existingColumns.includes('updated_at')) {
      await connection.query(`
        ALTER TABLE users
        ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      `);
      console.log('Added updated_at column to users table');
    }

    // Cập nhật password mặc định cho các user chưa có password
    const defaultPassword = '123456789';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    await connection.query(`
      UPDATE users 
      SET password = ?
      WHERE password IS NULL
    `, [hashedPassword]);

    // Kiểm tra note column trong order_items
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