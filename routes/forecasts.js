const express = require('express');
const router = express.Router();
const InventoryForecast = require('../models/InventoryForecast');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const { verifyToken, checkRole } = require('../middleware/auth');

// Get inventory forecast for a product
router.get('/:productId', verifyToken, async (req, res) => {
  try {
    const forecasts = await InventoryForecast.find({ product: req.params.productId })
      .populate('product', 'name price')
      .populate('store', 'name location');
    res.json({
      success: true,
      count: forecasts.length,
      data: forecasts
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate inventory forecast
router.post('/generate/:productId', verifyToken, checkRole(['admin', 'manager']), async (req, res) => {
  try {
    const { storeId } = req.body;
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Calculate average daily sales for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sales = await Sale.find({
      createdAt: { $gte: thirtyDaysAgo }
    }).populate('items.product');

    let totalQuantitySold = 0;
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (item.product._id.toString() === req.params.productId) {
          totalQuantitySold += item.quantity;
        }
      });
    });

    const averageDailySales = totalQuantitySold / 30;
    const currentStock = product.quantity;
    const forecastedDaysLeft = averageDailySales > 0 ? Math.floor(currentStock / averageDailySales) : 999;
    const recommendedReorderQuantity = Math.ceil(averageDailySales * 7); // 7 days supply

    let forecast = await InventoryForecast.findOne({
      product: req.params.productId,
      store: storeId
    });

    if (forecast) {
      forecast.currentStock = currentStock;
      forecast.averageDailySales = averageDailySales;
      forecast.forecastedDaysLeft = forecastedDaysLeft;
      forecast.recommendedReorderQuantity = recommendedReorderQuantity;
      forecast.lastUpdated = new Date();
      await forecast.save();
    } else {
      forecast = new InventoryForecast({
        product: req.params.productId,
        store: storeId,
        currentStock,
        averageDailySales,
        forecastedDaysLeft,
        recommendedReorderQuantity
      });
      await forecast.save();
    }

    await forecast.populate('product', 'name price');
    await forecast.populate('store', 'name location');

    res.json({
      success: true,
      message: 'Forecast generated successfully',
      data: forecast
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get critical inventory items
router.get('/critical/items', verifyToken, async (req, res) => {
  try {
    const criticalItems = await InventoryForecast.find({
      forecastedDaysLeft: { $lte: 3 }
    })
      .populate('product', 'name price')
      .populate('store', 'name location')
      .sort({ forecastedDaysLeft: 1 });

    res.json({
      success: true,
      count: criticalItems.length,
      data: criticalItems
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
