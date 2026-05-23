const express = require('express');
const router = express.Router();
const Store = require('../models/Store');
const { verifyToken, checkRole } = require('../middleware/auth');

// Get all stores
router.get('/', verifyToken, async (req, res) => {
  try {
    const stores = await Store.find()
      .populate('manager', 'name email')
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      count: stores.length,
      data: stores
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single store
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const store = await Store.findById(req.params.id).populate('manager', 'name email');
    if (!store) {
      return res.status(404).json({ success: false, error: 'Store not found' });
    }
    res.json({ success: true, data: store });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create store (admin only)
router.post('/', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const store = new Store(req.body);
    await store.save();
    await store.populate('manager', 'name email');
    res.status(201).json({
      success: true,
      message: 'Store created successfully',
      data: store
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update store (admin only)
router.put('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('manager', 'name email');
    
    if (!store) {
      return res.status(404).json({ success: false, error: 'Store not found' });
    }
    res.json({
      success: true,
      message: 'Store updated successfully',
      data: store
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete store (admin only)
router.delete('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const store = await Store.findByIdAndDelete(req.params.id);
    if (!store) {
      return res.status(404).json({ success: false, error: 'Store not found' });
    }
    res.json({
      success: true,
      message: 'Store deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
