const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.getLoginPage = (req, res) => {
  // Nếu đã có token hợp lệ, chuyển về trang chủ
  const token = req.cookies.token;
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return res.redirect('/');
    } catch (error) {
      res.clearCookie('token');
    }
  }
  res.render('auth/login', { error: null });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.render('auth/login', { 
        error: 'Email and password are required'
      });
    }
    
    const user = await User.authenticate(email, password);
    
    if (!user) {
      return res.render('auth/login', { 
        error: 'Invalid email or password'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.redirect('/');
  } catch (error) {
    console.error('Login error:', error);
    res.render('auth/login', { 
      error: 'Authentication failed'
    });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
}; 