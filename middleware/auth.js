const jwt = require('jsonwebtoken');
const Setting = require('../models/Setting');
const Order = require('../models/Order');

function authMiddleware(req, res, next) {
  // Skip auth for static files
  if (req.path.startsWith('/css') || req.path.startsWith('/js') || req.path.startsWith('/images')) {
    return next();
  }

  // Skip auth for login page and login post
  if (req.path === '/login' || req.path === '/logout') {
    return next();
  }

  // Get token from cookie
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/login');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Pass user info to views
    res.locals.user = decoded;
    next();
  } catch (error) {
    res.clearCookie('token');
    res.redirect('/login');
  }
}

function adminMiddleware(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  // If not admin but authenticated
  if (req.user) {
    return res.status(403).render('error', { 
      message: 'Access denied. Admin privileges required.' 
    });
  }
  
  res.redirect('/login');
}

async function orderMiddleware(req, res, next) {
  // Skip for GET requests
  if (req.method === 'GET') {
    return next();
  }
  
  try {
    const orderStatus = await Setting.getOrderStatus();
    // Allow admin to place order even when system is closed
    if (!orderStatus && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        error: 'Order system is currently closed'
      });
    }
    next();
  } catch (error) {
    console.error('Error checking order status:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}

async function orderActionMiddleware(req, res, next) {
  try {
    // Skip for GET requests
    if (req.method === 'GET') {
      return next();
    }

    // Get order and check ownership
    const orderId = req.params.id;
    const order = await Order.getOrderById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Allow all actions for admin
    if (req.user.role === 'admin') {
      const orderStatus = await Setting.getOrderStatus();
      if (orderStatus) {
        return next();
      }
    }

    // Check if user owns the order
    if (order.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You can only modify your own orders'
      });
    }

    // Check if order is from today
    const orderDate = new Date(order.date);
    const today = new Date();
    const isToday = orderDate.toDateString() === today.toDateString();

    // For DELETE requests, only allow if order is from today
    if (req.method === 'DELETE' && !isToday) {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete orders from previous days'
      });
    }

    // For other actions (PUT/POST), check system status
    const orderStatus = await Setting.getOrderStatus();
    if (!orderStatus) {
      return res.status(403).json({
        success: false,
        error: 'Order system is currently closed'
      });
    }

    next();
  } catch (error) {
    console.error('Error in orderActionMiddleware:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}

module.exports = {
  authMiddleware,
  adminMiddleware,
  orderMiddleware,
  orderActionMiddleware
}; 