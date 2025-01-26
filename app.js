const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
require('dotenv').config();

const initDatabase = require('./config/init-db');
const runMigrations = require('./config/migrations');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// Middleware
app.set('view engine', 'ejs');
app.locals.formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Trust proxy (needed when behind Nginx)
app.set('trust proxy', 'loopback');

// Routes
app.use('/menu', menuRoutes);
app.use('/orders', orderRoutes);
app.use('/reports', reportRoutes);

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
    });
  })
  .catch(error => {
    console.error('Error starting application:', error);
    process.exit(1);
  }); 