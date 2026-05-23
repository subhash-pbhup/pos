const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

// Generate PDF Invoice
const generateInvoicePDF = (saleData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const fileName = `invoice-${saleData.saleNumber}-${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '../invoices', fileName);

      // Create invoices directory if not exists
      if (!fs.existsSync(path.join(__dirname, '../invoices'))) {
        fs.mkdirSync(path.join(__dirname, '../invoices'), { recursive: true });
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('INVOICE', 50, 50);
      doc.fontSize(10).font('Helvetica').text('POS System', 50, 75);

      // Sale Details
      doc.fontSize(10).text(`Sale #: ${saleData.saleNumber}`, 50, 110);
      doc.text(`Date: ${new Date(saleData.createdAt).toLocaleDateString()}`, 50, 125);
      doc.text(`Payment: ${saleData.paymentMethod.toUpperCase()}`, 50, 140);

      // Items Table
      doc.fontSize(11).font('Helvetica-Bold').text('Items', 50, 180);
      let tableTop = 210;

      // Table Headers
      doc.fontSize(9).font('Helvetica-Bold')
        .text('Product', 50, tableTop)
        .text('Qty', 250, tableTop)
        .text('Price', 300, tableTop)
        .text('Total', 380, tableTop);

      doc.moveTo(50, tableTop + 15).lineTo(500, tableTop + 15).stroke();
      tableTop += 25;

      // Table Items
      doc.font('Helvetica').fontSize(9);
      saleData.items.forEach((item, index) => {
        doc.text(item.product.name.substring(0, 20), 50, tableTop)
          .text(item.quantity.toString(), 250, tableTop)
          .text(`₹${item.price.toFixed(2)}`, 300, tableTop)
          .text(`₹${item.subtotal.toFixed(2)}`, 380, tableTop);
        tableTop += 20;
      });

      doc.moveTo(50, tableTop).lineTo(500, tableTop).stroke();
      tableTop += 20;

      // Totals
      doc.font('Helvetica').fontSize(10)
        .text(`Subtotal: ₹${saleData.subtotal.toFixed(2)}`, 300, tableTop)
        .text(`Tax: ₹${saleData.tax.toFixed(2)}`, 300, tableTop + 20)
        .text(`Discount: ₹${saleData.totalDiscount.toFixed(2)}`, 300, tableTop + 40);

      doc.font('Helvetica-Bold').fontSize(12)
        .text(`TOTAL: ₹${saleData.total.toFixed(2)}`, 300, tableTop + 70);

      // Footer
      doc.fontSize(8).font('Helvetica').text('Thank you for your purchase!', 50, 700, { align: 'center' });
      doc.text('This is an automated invoice from POS System', 50, 720, { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Export to CSV
const exportToCSV = async (data, filename) => {
  try {
    const filePath = path.join(__dirname, '../exports', `${filename}-${Date.now()}.csv`);

    // Create exports directory if not exists
    if (!fs.existsSync(path.join(__dirname, '../exports'))) {
      fs.mkdirSync(path.join(__dirname, '../exports'), { recursive: true });
    }

    let csv = '';

    if (Array.isArray(data) && data.length > 0) {
      // Headers
      const headers = Object.keys(data[0]);
      csv = headers.join(',') + '\n';

      // Data
      data.forEach(row => {
        const values = headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        });
        csv += values.join(',') + '\n';
      });
    }

    fs.writeFileSync(filePath, csv);
    return filePath;
  } catch (error) {
    console.error('CSV export failed:', error);
    throw error;
  }
};

// Export to Excel
const exportToExcel = async (data, filename) => {
  try {
    const filePath = path.join(__dirname, '../exports', `${filename}-${Date.now()}.xlsx`);

    // Create exports directory if not exists
    if (!fs.existsSync(path.join(__dirname, '../exports'))) {
      fs.mkdirSync(path.join(__dirname, '../exports'), { recursive: true });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    if (Array.isArray(data) && data.length > 0) {
      // Add headers
      const headers = Object.keys(data[0]);
      worksheet.addRow(headers);

      // Add data
      data.forEach(row => {
        const values = headers.map(header => row[header]);
        worksheet.addRow(values);
      });

      // Format header row
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4f46e5' }
      };

      // Adjust column widths
      headers.forEach((header, index) => {
        worksheet.columns[index].width = 15;
      });
    }

    await workbook.xlsx.writeFile(filePath);
    return filePath;
  } catch (error) {
    console.error('Excel export failed:', error);
    throw error;
  }
};

module.exports = { generateInvoicePDF, exportToCSV, exportToExcel };
