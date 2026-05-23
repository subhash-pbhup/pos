const nodemailer = require('nodemailer');

// Configure email service
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Send sale confirmation email
const sendSaleEmail = async (customerEmail, saleData) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: customerEmail,
      subject: `Sale Invoice #${saleData.saleNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Sale Invoice</h2>
          <p><strong>Sale Number:</strong> ${saleData.saleNumber}</p>
          <p><strong>Date:</strong> ${new Date(saleData.createdAt).toLocaleDateString()}</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f0f0f0;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Product</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Qty</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Price</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total</th>
            </tr>
            ${saleData.items.map(item => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.product.name}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₹${item.price.toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₹${item.subtotal.toFixed(2)}</td>
              </tr>
            `).join('')}
          </table>
          
          <div style="margin-top: 20px; border-top: 2px solid #333; padding-top: 10px;">
            <p><strong>Subtotal:</strong> ₹${saleData.subtotal.toFixed(2)}</p>
            <p><strong>Tax:</strong> ₹${saleData.tax.toFixed(2)}</p>
            <p><strong>Discount:</strong> ₹${saleData.totalDiscount.toFixed(2)}</p>
            <h3 style="color: #4f46e5;">Total: ₹${saleData.total.toFixed(2)}</h3>
          </div>
          
          <p style="margin-top: 20px; font-size: 12px; color: #666;">
            Thank you for your purchase! This is an automated email.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✓ Sale email sent to:', customerEmail);
  } catch (error) {
    console.error('✗ Email sending failed:', error.message);
  }
};

// Send low stock alert
const sendLowStockAlert = async (adminEmail, products) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: 'Low Stock Alert - POS System',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>⚠️ Low Stock Alert</h2>
          <p>The following products have low stock:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f0f0f0;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Product</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Current Stock</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Action</th>
            </tr>
            ${products.map(product => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${product.name}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${product.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">
                  <span style="color: ${product.quantity === 0 ? 'red' : 'orange'};">⚠️</span>
                </td>
              </tr>
            `).join('')}
          </table>
          <p>Please reorder these items as soon as possible.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✓ Low stock alert sent');
  } catch (error) {
    console.error('✗ Alert email failed:', error.message);
  }
};

module.exports = { sendSaleEmail, sendLowStockAlert };
