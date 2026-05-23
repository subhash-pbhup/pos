const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const Product = require('../models/Product');
const { verifyToken, checkRole } = require('../middleware/auth');

// Generate daily report
router.post('/generate/daily', verifyToken, checkRole(['admin', 'manager']), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const sales = await Sale.find({
      createdAt: { $gte: today, $lte: endOfDay }
    }).populate('items.product');

    const expenses = await Expense.find({
      createdAt: { $gte: today, $lte: endOfDay }
    });

    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalTransactions = sales.length;
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalProfit = totalSales - totalExpenses;

    // Calculate payment breakdown
    const paymentBreakdown = {
      cash: 0,
      card: 0,
      cheque: 0,
      online: 0
    };

    sales.forEach(sale => {
      paymentBreakdown[sale.paymentMethod] += sale.total;
    });

    // Get top products
    const productMap = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const productId = item.product._id.toString();
        if (!productMap[productId]) {
          productMap[productId] = {
            product: item.product._id,
            name: item.product.name,
            quantity: 0,
            revenue: 0
          };
        }
        productMap[productId].quantity += item.quantity;
        productMap[productId].revenue += item.subtotal;
      });
    });

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const report = new Report({
      reportType: 'daily',
      startDate: today,
      endDate: endOfDay,
      totalSales,
      totalTransactions,
      totalExpenses,
      totalProfit,
      paymentMethodBreakdown: paymentBreakdown,
      topProducts,
      generatedBy: req.user.id
    });

    await report.save();
    res.status(201).json({
      success: true,
      message: 'Daily report generated successfully',
      data: report
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get all reports
router.get('/', verifyToken, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('generatedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get dashboard data
router.get('/dashboard/stats', verifyToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaySales = await Sale.find({
      createdAt: { $gte: today, $lte: endOfDay }
    });

    const totalRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    const totalTransactions = todaySales.length;
    const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.find({ quantity: { $lt: 10 } });

    res.json({
      success: true,
      data: {
        todayRevenue: totalRevenue,
        todayTransactions: totalTransactions,
        avgTransaction: avgTransaction,
        totalProducts,
        lowStockProducts: lowStockProducts.length,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
