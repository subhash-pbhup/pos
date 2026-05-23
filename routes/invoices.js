const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const { generateInvoicePDF, exportToCSV, exportToExcel } = require('../services/exportService');
const { sendSaleEmail } = require('../services/emailService');
const { verifyToken } = require('../middleware/auth');

// Generate PDF invoice
router.get('/:saleId/invoice-pdf', verifyToken, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.saleId)
      .populate('cashier', 'name email')
      .populate('items.product');

    if (!sale) {
      return res.status(404).json({ success: false, error: 'Sale not found' });
    }

    const pdfPath = await generateInvoicePDF(sale);
    res.download(pdfPath, `invoice-${sale.saleNumber}.pdf`);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export sales to CSV
router.post('/export/csv', verifyToken, async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;
    const fromD = new Date(fromDate);
    const toD = new Date(toDate);
    toD.setHours(23, 59, 59);

    const sales = await Sale.find({
      createdAt: { $gte: fromD, $lte: toD }
    })
      .populate('cashier', 'name')
      .populate('items.product', 'name price')
      .lean();

    // Format data for CSV
    const csvData = sales.map(sale => ({
      'Sale Number': sale.saleNumber,
      'Total': sale.total,
      'Payment Method': sale.paymentMethod,
      'Cashier': sale.cashier.name,
      'Date': new Date(sale.createdAt).toLocaleDateString(),
      'Items Count': sale.items.length,
      'Tax': sale.tax,
      'Discount': sale.totalDiscount
    }));

    const csvPath = await exportToCSV(csvData, 'sales');
    res.download(csvPath, `sales-${Date.now()}.csv`);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export sales to Excel
router.post('/export/excel', verifyToken, async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;
    const fromD = new Date(fromDate);
    const toD = new Date(toDate);
    toD.setHours(23, 59, 59);

    const sales = await Sale.find({
      createdAt: { $gte: fromD, $lte: toD }
    })
      .populate('cashier', 'name')
      .populate('items.product', 'name price')
      .lean();

    const excelData = sales.map(sale => ({
      'Sale Number': sale.saleNumber,
      'Total': sale.total,
      'Payment Method': sale.paymentMethod,
      'Cashier': sale.cashier.name,
      'Date': new Date(sale.createdAt).toLocaleDateString(),
      'Items Count': sale.items.length,
      'Tax': sale.tax,
      'Discount': sale.totalDiscount
    }));

    const excelPath = await exportToExcel(excelData, 'sales');
    res.download(excelPath, `sales-${Date.now()}.xlsx`);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send invoice via email
router.post('/:saleId/send-email', verifyToken, async (req, res) => {
  try {
    const { customerEmail } = req.body;
    const sale = await Sale.findById(req.params.saleId)
      .populate('cashier', 'name')
      .populate('items.product');

    if (!sale) {
      return res.status(404).json({ success: false, error: 'Sale not found' });
    }

    await sendSaleEmail(customerEmail, sale);

    res.json({
      success: true,
      message: 'Invoice sent successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
