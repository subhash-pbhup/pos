const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { verifyToken, checkRole } = require('../middleware/auth');

// Get all expenses
router.get('/', verifyToken, async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get expenses by category
router.get('/category/:category', verifyToken, async (req, res) => {
  try {
    const expenses = await Expense.find({ category: req.params.category })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: expenses.length, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get expenses by date range
router.get('/date/:fromDate/:toDate', verifyToken, async (req, res) => {
  try {
    const fromDate = new Date(req.params.fromDate);
    const toDate = new Date(req.params.toDate);
    toDate.setHours(23, 59, 59);

    const expenses = await Expense.find({
      createdAt: { $gte: fromDate, $lte: toDate }
    })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    res.json({ success: true, count: expenses.length, total, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create expense
router.post('/', verifyToken, async (req, res) => {
  try {
    const expense = new Expense({
      ...req.body,
      createdBy: req.user.id
    });
    await expense.save();
    await expense.populate('createdBy', 'name email');
    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: expense
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Approve expense (admin only)
router.put('/:id/approve', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { approvedBy: req.user.id },
      { new: true }
    ).populate('createdBy', 'name email');
    
    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }
    res.json({ success: true, message: 'Expense approved', data: expense });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete expense
router.delete('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
