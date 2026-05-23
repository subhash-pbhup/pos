# 🏪 POS (Point of Sale) System

**एक comprehensive Point of Sale system जो Node.js और Express का उपयोग करके बनाया गया है।**

## ✨ Features

✅ **Product Management** - Products को add, update, delete करें  
✅ **Sales Management** - Sales record करें और track करें  
✅ **User Authentication** - Admin, Cashier, और Manager roles  
✅ **Inventory Management** - Real-time stock tracking  
✅ **Payment Methods** - Cash, Card, Cheque, Online support  
✅ **Sales Reports** - Daily/Date range reports  
✅ **Search & Filter** - Products को barcode या name से search करें  
✅ **Dashboard Summary** - Today's sales summary  

## 🛠️ Technology Stack

- **Backend:** Node.js + Express.js
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** bcryptjs for password hashing
- **Validation:** Data validation

## 📋 Prerequisites

- Node.js (v14+)
- MongoDB (Local या MongoDB Atlas)
- npm या yarn
- Postman (API testing के लिए)

## 🚀 Installation

### 1️⃣ Repository Clone करें

```bash
git clone https://github.com/subhash-pbhup/pos.git
cd pos
```

### 2️⃣ Dependencies Install करें

```bash
npm install
```

### 3️⃣ Environment Variables सेट करें

```bash
cp .env.example .env
```

अपने `.env` file में values update करें:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pos_db
JWT_SECRET=your_very_secret_key_change_this_in_production
NODE_ENV=development
```

### 4️⃣ Server Start करें

**Development Mode (Auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

✅ Server चलेगा: `http://localhost:5000`

---

## 📡 API Endpoints

### 🛍️ Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | सभी products देखें |
| GET | `/api/products/:id` | एक product देखें |
| GET | `/api/products/search/:query` | Products को search करें |
| POST | `/api/products` | नया product add करें |
| PUT | `/api/products/:id` | Product update करें |
| DELETE | `/api/products/:id` | Product delete करें |

### 💰 Sales

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sales` | सभी sales देखें |
| GET | `/api/sales/:id` | एक sale देखें |
| GET | `/api/sales/date/:fromDate/:toDate` | Date range के sales देखें |
| GET | `/api/sales/summary/today` | Today का summary |
| POST | `/api/sales` | नया sale create करें |

### 👤 Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | नया user register करें |
| POST | `/api/users/login` | User login करें |
| GET | `/api/users` | सभी users देखें |
| GET | `/api/users/:id` | एक user देखें |
| PUT | `/api/users/:id` | User update करें |
| DELETE | `/api/users/:id` | User delete करें |

---

## 💡 Example API Requests

### 1️⃣ Product Create करना

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Coca Cola",
    "price": 50,
    "quantity": 100,
    "category": "Beverages",
    "barcode": "1234567890",
    "description": "Cold drink"
  }'
```

### 2️⃣ User Registration

```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Raj Kumar",
    "email": "raj@example.com",
    "password": "password123",
    "role": "cashier",
    "phone": "9876543210"
  }'
```

### 3️⃣ User Login

```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "raj@example.com",
    "password": "password123"
  }'
```

**Response में token मिलेगा जिसे आप अन्य requests में use कर सकते हैं।**

### 4️⃣ Sale Create करना

```bash
curl -X POST http://localhost:5000/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "product": "product_id_here",
        "quantity": 2,
        "discount": 0
      }
    ],
    "paymentMethod": "cash",
    "cashier": "user_id_here",
    "tax": 50,
    "totalDiscount": 0,
    "notes": "Customer note here"
  }'
```

### 5️⃣ Products को Search करना

```bash
curl http://localhost:5000/api/products/search/coca
```

### 6️⃣ Today का Sales Summary

```bash
curl http://localhost:5000/api/sales/summary/today
```

---

## 📁 Project Structure

```
pos/
├── models/
│   ├── Product.js      # Product model schema
│   ├── Sale.js         # Sale model schema
│   └── User.js         # User model schema
├── routes/
│   ├── products.js     # Product routes & CRUD
│   ├── sales.js        # Sales routes & reports
│   └── users.js        # User & auth routes
├── server.js           # Main Express server
├── package.json        # Dependencies
├── .env.example        # Environment variables template
├── .gitignore          # Git ignore file
└── README.md           # This file
```

---

## 🔒 Security Features

✅ **Password Hashing** - bcryptjs के साथ secure passwords  
✅ **JWT Authentication** - Token-based authentication  
✅ **Input Validation** - Data validation on all endpoints  
✅ **CORS** - Cross-origin requests को handle करता है  
✅ **Error Handling** - Comprehensive error handling  

---

## 📊 Database Schema

### Product Schema
```javascript
{
  name: String (required),
  barcode: String (unique),
  price: Number (required),
  quantity: Number (required),
  category: String (required),
  description: String,
  sku: String (unique),
  image: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Sale Schema
```javascript
{
  saleNumber: String (unique),
  items: [{
    product: ObjectId,
    quantity: Number,
    price: Number,
    discount: Number,
    subtotal: Number
  }],
  subtotal: Number,
  tax: Number,
  totalDiscount: Number,
  total: Number,
  paymentMethod: String (cash/card/cheque/online),
  cashier: ObjectId (User reference),
  notes: String,
  createdAt: Date
}
```

### User Schema
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (hashed),
  role: String (admin/cashier/manager),
  phone: String,
  isActive: Boolean,
  createdAt: Date
}
```

---

## 🧪 Testing

### Postman से Test करने के लिए:

1. **Postman download** करें
2. **New Collection बनाएं**
3. ऊपर दिए गए API requests को test करें
4. Login से token लें और अन्य requests में use करें

---

## 🔄 Development करते समय

```bash
# Auto-reload के साथ development
npm run dev

# सिर्फ production के लिए
npm start

# Dependencies को update करने के लिए
npm update
```

---

## 🚀 Future Enhancements

- [ ] Dashboard with analytics & charts
- [ ] Barcode scanning integration
- [ ] Invoice printing
- [ ] Multi-store support
- [ ] Advanced reporting (Daily, Weekly, Monthly)
- [ ] Customer management
- [ ] Expense tracking
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Data backup & export (CSV, PDF)

---

## 🤝 Contributing

Issues और improvements के लिए pull requests welcome हैं!

```bash
# Fork करें
# Branch बनाएं
git checkout -b feature/your-feature

# Commit करें
git commit -am 'Add new feature'

# Push करें
git push origin feature/your-feature

# Pull Request बनाएं
```

---

## 📝 License

ISC License - Free to use

---

## 📞 Support

अगर कोई issue या question हो तो GitHub Issues में create करें।

---

**Made with ❤️ by Subhash Chander**

*Last Updated: 2026-05-23*
