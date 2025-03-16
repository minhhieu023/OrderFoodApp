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
      // Thêm cột email trước (nullable)
      await connection.query(`
        ALTER TABLE users
        ADD COLUMN email VARCHAR(255) UNIQUE
      `);
      
      // Update email cho các user hiện tại
      const [users] = await connection.query('SELECT id FROM users');
      for (const user of users) {
        await connection.query(
          'UPDATE users SET email = ? WHERE id = ?',
          [`user${user.id}@example.com`, user.id]
        );
      }
      
      // Sau đó mới set NOT NULL
      await connection.query(`
        ALTER TABLE users
        MODIFY email VARCHAR(255) UNIQUE NOT NULL
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

    // Thêm cột role nếu chưa tồn tại
    if (!existingColumns.includes('role')) {
      await connection.query(`
        ALTER TABLE users
        ADD COLUMN role ENUM('user', 'admin') NOT NULL DEFAULT 'user'
      `);
      console.log('Added role column to users table');
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

    // Kiểm tra và tạo bảng settings nếu chưa tồn tại
    await connection.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL UNIQUE,
        value TEXT,
        status BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Thêm setting cho order_status nếu chưa có
    const [settings] = await connection.query('SELECT * FROM settings WHERE name = ?', ['order_status']);
    if (settings.length === 0) {
      await connection.query(
        'INSERT INTO settings (name, value, status) VALUES (?, ?, ?)',
        ['order_status', 'Order system is open', true]
      );
    }

    // Thêm setting cho notification_time nếu chưa có
    const [notifSettings] = await connection.query('SELECT * FROM settings WHERE name = ?', ['notification_time']);
    if (notifSettings.length === 0) {
      await connection.query(
        'INSERT INTO settings (name, value) VALUES (?, ?)',
        ['notification_time', '11:00']
      );
    }

    // Thêm setting cho notification content nếu chưa có
    const [notifContent] = await connection.query('SELECT * FROM settings WHERE name = ?', ['notification_content']);
    if (notifContent.length === 0) {
      await connection.query(
        'INSERT INTO settings (name, value) VALUES (?, ?)',
        ['notification_content', JSON.stringify({
          title: 'Food Order Reminder',
          body: "It's time to order your lunch!"
        })]
      );
    }

    // Tạo bảng invoices
    await connection.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR(20) PRIMARY KEY,
        user_id INT NOT NULL,
        month INT NOT NULL,
        year INT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status ENUM('new', 'transferred', 'confirmed', 'cancelled', 'pending', 'not_received') DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        paid_at TIMESTAMP NULL,
        note TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Cập nhật ENUM values cho cột status nếu cần
    await connection.query(`
      ALTER TABLE invoices MODIFY COLUMN status 
      ENUM('new', 'transferred', 'confirmed', 'cancelled', 'pending', 'not_received') 
      DEFAULT 'new'
    `);

    // Kiểm tra và thêm cột note nếu chưa có
    const [invoiceColumns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'invoices' 
      AND COLUMN_NAME = 'note'
    `, [process.env.DB_NAME]);

    if (invoiceColumns.length === 0) {
      await connection.query(`
        ALTER TABLE invoices
        ADD COLUMN note TEXT
      `);
      console.log('Added note column to invoices table');
    }

    // Tạo bảng invoice_items
    await connection.query(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        invoice_id VARCHAR(20) NOT NULL,
        order_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id),
        FOREIGN KEY (order_id) REFERENCES orders(id)
      )
    `);

    await connection.end();
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

module.exports = runMigrations; 