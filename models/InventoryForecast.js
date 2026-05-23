const mongoose = require('mongoose');

const inventoryForecastSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  currentStock: {
    type: Number,
    required: true
  },
  averageDailySales: {
    type: Number,
    default: 0
  },
  forecastedDaysLeft: {
    type: Number,
    default: 0
  },
  recommendedReorderQuantity: {
    type: Number,
    default: 0
  },
  reorderLevel: {
    type: Number,
    default: 10
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('InventoryForecast', inventoryForecastSchema);
