const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');

// Get all sales
router.get('/', async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('cashier', 'name email')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: sales.length,
      data: sales
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get sales by date range
router.get('/date/:fromDate/:toDate', async (req, res) => {
  try {
    const fromDate = new Date(req.params.fromDate);
    const toDate = new Date(req.params.toDate);
    toDate.setHours(23, 59, 59);

    const sales = await Sale.find({
      createdAt: { $gte: fromDate, $lte: toDate }
    })
      .populate('cashier', 'name email')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: sales.length, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single sale
router.get('/:id', async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('cashier', 'name email')
      .populate('items.product');
    
    if (!sale) {
      return res.status(404).json({ success: false, error: 'Sale not found' });
    }
    res.json({ success: true, data: sale });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new sale
router.post('/', async (req, res) => {
  try {
    const { items, paymentMethod, cashier, tax = 0, totalDiscount = 0, notes = '' } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'No items in sale' });
    }

    let subtotal = 0;
    const processedItems = [];

    for (let item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, error: `Product ${item.product} not found` });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          error: `Insufficient stock for ${product.name}` 
        });
      }

      const itemSubtotal = (product.price * item.quantity) - (item.discount || 0);
      subtotal += itemSubtotal;

      processedItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        discount: item.discount || 0,
        subtotal: itemSubtotal
      });

      // Update product quantity
      product.quantity -= item.quantity;
      await product.save();
    }

    const total = subtotal + tax - totalDiscount;
    const saleNumber = `SALE-${Date.now()}`;

    const sale = new Sale({
      saleNumber,
      items: processedItems,
      subtotal,
      tax,
      totalDiscount,
      total,
      paymentMethod,
      cashier,
      notes
    });

    await sale.save();
    await sale.populate('cashier', 'name email');
    await sale.populate('items.product', 'name price');

    res.status(201).json({
      success: true,
      message: 'Sale created successfully',
      data: sale
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get sales summary/dashboard
router.get('/summary/today', async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const sales = await Sale.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const totalSales = sales.length;
    const totalAmount = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalItems = sales.reduce((sum, sale) => sum + sale.items.length, 0);

    res.json({
      success: true,
      data: {
        totalSales,
        totalAmount,
        totalItems,
        avgTransaction: totalSales > 0 ? totalAmount / totalSales : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
