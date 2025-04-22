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

exports.getRegisterPage = (req, res) => {
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
  res.render('auth/register', { error: null });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validate required fields
    if (!name || !email || !password || !confirmPassword) {
      return res.render('auth/register', { 
        error: 'All fields are required'
      });
    }

    // Validate password match
    if (password !== confirmPassword) {
      return res.render('auth/register', { 
        error: 'Passwords do not match'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.render('auth/register', { 
        error: 'Password must be at least 6 characters long'
      });
    }

    // Check if email already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.render('auth/register', { 
        error: 'Email already registered'
      });
    }

    // Create user
    await User.create(name, email, password, 'user');

    // Redirect to login page with success message
    res.redirect('/login?registered=true');
  } catch (error) {
    console.error('Registration error:', error);
    res.render('auth/register', { 
      error: error.message || 'Registration failed'
    });
  }
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

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.redirect('/');
  } catch (error) {
    console.error('Login error:', error);
    res.render('auth/login', { 
      error: 'Login failed'
    });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
};