const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const initDatabase = require('./config/init-db');
const runMigrations = require('./config/migrations');
const { authMiddleware, adminMiddleware } = require('./middleware/auth');
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const { scheduleMonthlyInvoices } = require('./jobs/invoiceJob');

const app = express();

// Middleware
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.locals.formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Trust proxy (needed when behind Nginx)
app.set('trust proxy', 'loopback');

// Auth routes (must be before auth middleware)
app.use('/', authRoutes);

// Auth middleware for protected routes
app.use(authMiddleware);

// Protected routes
app.use('/menu', adminMiddleware, menuRoutes);
app.use('/orders', orderRoutes);
app.use('/reports', reportRoutes);
app.use('/users', adminMiddleware, userRoutes);
app.use('/profile', authMiddleware, profileRoutes);
app.use('/invoices', invoiceRoutes);

// Home route
app.get('/', (req, res) => {
  res.redirect('/orders');
});

// Initialize database and start server
initDatabase()
  .then(() => runMigrations())
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      // Start cron jobs
      scheduleMonthlyInvoices();
    });
  })
  .catch(error => {
    console.error('Error starting application:', error);
    process.exit(1);
  }); 