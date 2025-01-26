const Menu = require('../models/Menu');

exports.getAllMenu = async (req, res) => {
  try {
    const menu = await Menu.getAll();
    res.render('menu/index', { menu });
  } catch (error) {
    res.status(500).send('Server error');
  }
};

exports.addMenuItem = async (req, res) => {
  try {
    const { name, price } = req.body;
    await Menu.add(name, Math.round(parseFloat(price)));
    res.redirect('/menu');
  } catch (error) {
    res.status(500).send('Server error');
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const { id, name, price } = req.body;
    if (!id || !name || !price) {
      throw new Error('Missing required fields');
    }
    await Menu.update(parseInt(id), name, Math.round(parseFloat(price)));
    res.redirect('/menu');
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).send('Error updating menu item');
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    await Menu.delete(id);
    res.redirect('/menu');
  } catch (error) {
    res.status(500).send('Server error');
  }
}; 