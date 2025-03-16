const Menu = require('../models/Menu');
const Order = require('../models/Order');
const Setting = require('../models/Setting');

exports.getOrders = async (req, res) => {
  try {
    const menu = await Menu.getAll();
    const orderStatus = await Setting.getOrderStatus();
    res.render('orders/index', { 
      menu,
      orderStatus,
      isAdmin: req.user.role === 'admin'
    });
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).send('Server error');
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { items, total } = req.body;
    
    if (!items || !total) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const orderId = await Order.create(req.user.id, items, total);
    const order = await Order.getOrderById(orderId);
    res.status(200).json({ 
      success: true,
      orderId: orderId
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getDailyReport = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const orders = await Order.getDailyReport(date);
    res.render('orders/report', { 
      orders, 
      date,
      user: req.user
    });
  } catch (error) {
    console.error('Error getting daily report:', error);
    res.status(500).send('Server error');
  }
};

exports.getOrderDetail = async (req, res) => {
  try {
    const orderId = req.params.id;
    const orderDetails = await Order.getOrderDetail(orderId);
    
    if (orderDetails.length === 0) {
      return res.status(404).send('Order not found');
    }
    
    res.render('orders/detail', { 
      orderDetails,
      orderId: orderDetails[0].orderId,
      customerName: orderDetails[0].customerName,
      orderDate: orderDetails[0].date,
      orderTotal: orderDetails[0].orderTotal
    });
  } catch (error) {
    console.error('Error getting order detail:', error);
    res.status(500).send('Server error');
  }
};

exports.getEditOrderPage = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.getOrderById(orderId);
    const menu = await Menu.getAll();

    if (!order) {
      return res.status(404).send('Order not found');
    }

    // Check if user has permission to edit this order
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).render('error', {
        message: 'You can only edit your own orders'
      });
    }

    // Parse items from JSON string if needed
    if (typeof order.items === 'string') {
      order.items = JSON.parse(order.items);
    }

    res.render('orders/edit', { order, menu });
  } catch (error) {
    console.error('Error getting edit order page:', error);
    res.status(500).send('Server error');
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { items, total } = req.body;

    await Order.updateOrder(orderId, items, total);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to update order' 
    });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    await Order.deleteOrder(orderId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to delete order' 
    });
  }
};

exports.getOrderSuccess = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.getOrderById(orderId);
    
    if (!order) {
      return res.status(404).send('Order not found');
    }
    
    res.render('orders/success', { order });
  } catch (error) {
    console.error('Error getting order success page:', error);
    res.status(500).send('Server error');
  }
};

exports.toggleOrderStatus = async (req, res) => {
  try {
    const currentStatus = await Setting.getOrderStatus();
    await Setting.setOrderStatus(!currentStatus);
    res.json({ success: true, status: !currentStatus });
  } catch (error) {
    console.error('Error toggling order status:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}; 