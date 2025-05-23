const Order = require('../models/Order');

exports.getCustomerReportPage = async (req, res) => {
  try {
    const customers = await Order.getCustomers();
    res.render('reports/customer', { 
      customers,
      selectedCustomer: null,
      startDate: null,
      endDate: null,
      report: null
    });
  } catch (error) {
    console.error('Error getting customer report page:', error);
    res.status(500).send('Server error');
  }
};

exports.getCustomerReport = async (req, res) => {
  try {
    const { customerId, startDate, endDate } = req.query;
    const customers = await Order.getCustomers();
    const report = await Order.getCustomerReport(customerId, startDate, endDate);
    
    const selectedCustomer = customers.find(c => c.id === parseInt(customerId));

    res.render('reports/customer', {
      customers,
      selectedCustomer,
      startDate,
      endDate,
      report,
      scripts: ['/js/customer-report.js']
    });
  } catch (error) {
    console.error('Error getting customer report:', error);
    res.status(500).send('Server error');
  }
};

exports.getDailyReport = async (req, res) => {
  try {
    const orders = await Order.getDailyReport();
    res.render('orders/report', { 
      orders,
      scripts: ['/js/report.js']
    });
  } catch (error) {
    console.error('Error getting daily report:', error);
    res.status(500).send('Server error');
  }
}; 