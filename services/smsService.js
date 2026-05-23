// SMS Service using Twilio or AWS SNS
const sendSMS = async (phoneNumber, message) => {
  try {
    // Mock SMS for demo
    console.log(`📱 SMS sent to ${phoneNumber}: ${message}`);
    
    // Uncomment below to use Twilio:
    // const twilio = require('twilio');
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //   body: message,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phoneNumber
    // });
  } catch (error) {
    console.error('✗ SMS failed:', error.message);
  }
};

// Send sale notification SMS
const sendSaleNotification = async (phone, saleNumber, total) => {
  const message = `Sale #${saleNumber} completed. Total: ₹${total.toFixed(2)}. Thank you for shopping!`;
  await sendSMS(phone, message);
};

// Send low stock alert SMS
const sendLowStockSMS = async (adminPhone, productCount) => {
  const message = `⚠️ Alert: ${productCount} products have low stock. Please reorder soon.`;
  await sendSMS(adminPhone, message);
};

module.exports = { sendSMS, sendSaleNotification, sendLowStockSMS };
