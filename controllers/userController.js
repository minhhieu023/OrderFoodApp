const User = require('../models/User');
const Setting = require('../models/Setting');
const pool = require('../config/database');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.render('users/index', { users });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).send('Server error');
  }
};

exports.addUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).send('Missing required fields');
    }
    
    await User.create(name, email, password, role);
    res.redirect('/users');
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).send(error.message || 'Server error');
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id, name, email, role } = req.body;
    if (!id || !name || !email || !role) {
      return res.status(400).send('Missing required fields');
    }
    
    await User.update(id, name, email, role);
    res.redirect('/users');
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Server error');
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    
    if (!id || !password) {
      return res.status(400).send('Missing required fields');
    }
    
    await User.updatePassword(id, password);
    res.redirect('/users');
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).send('Server error');
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.delete(id);
    res.redirect('/users');
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send(error.message || 'Server error');
  }
};

exports.getNotificationTime = async (req, res) => {
  try {
    const time = await Setting.getNotificationTime();
    res.json({ success: true, time });
  } catch (error) {
    console.error('Error getting notification time:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.setNotificationTime = async (req, res) => {
  try {
    const { time } = req.body;
    if (!time || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      return res.status(400).json({ success: false, error: 'Invalid time format' });
    }
    await Setting.setNotificationTime(time);
    res.json({ success: true });
  } catch (error) {
    console.error('Error setting notification time:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getNotificationContent = async (req, res) => {
  try {
    const content = await Setting.getNotificationContent();
    res.json({ success: true, content });
  } catch (error) {
    console.error('Error getting notification content:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.setNotificationContent = async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) {
      return res.status(400).json({ success: false, error: 'Title and body are required' });
    }
    await Setting.setNotificationContent({ title, body });
    res.json({ success: true });
  } catch (error) {
    console.error('Error setting notification content:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getUsersList = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name FROM users ORDER BY name'
    );
    res.json(users);
  } catch (error) {
    console.error('Error getting users list:', error);
    res.status(500).json({ error: 'Server error' });
  }
}; 