// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// ✅ Import Schemas
import RegisterModel from './models/Schema.js';
import ProductModel from './models/ProductsSchema.js';
import NewsletterModel from './models/NewsLetterSchema.js';
import BannerModel from './models/BannerSchema.js';
import OrderModel from './models/Order.js';
import Register from './models/UserAuth.js'; // ✅ Login/Signup schema

const app = express();
const PORT = 4000;
const DOMAIN = 'https://api.366daysfruit.com';

// ✅ Handle __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Create uploads folder if not exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log("📂 'uploads' folder created");
}

// ✅ Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/366DaysFruits', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Middleware
const allowedOrigins = [
  'https://daysfruits-userside.firebaseapp.com',
  'https://daysfruis-adminside.firebaseapp.com',
  'https://366daysfruit.com',
  'https://www.366daysfruit.com',
  'https://366daysfruit.web.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

/* ------------------- USER REGISTER (Dashboard login) ------------------- */
app.get('/api/registers', async (req, res) => {
  try {
    const users = await Register.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/registers', async (req, res) => {
  const { username, phone, password } = req.body;

  if (!username || !phone || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const existingUser = await Register.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ error: "Mobile number already registered." });
    }

    const newUser = new Register({ username, phone, password });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Registration failed." });
  }
});

/* ------------------- Website APIs ------------------- */

// ✅ Member Registration
app.post('/api/register', async (req, res) => {
  try {
    const { email, firstName, lastName, phone, shopName } = req.body;
    if (!email || !firstName || !lastName || !phone || !shopName) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const newUser = new RegisterModel({ email, firstName, lastName, phone, shopName });
    await newUser.save();
    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/registers-userside', async (req, res) => {
  try {
    const users = await RegisterModel.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Fruits
app.post('/api/fruits', upload.single('image'), async (req, res) => {
  try {
    const { name, weight, pieces, boxWeight, boxPrice, rating, quantity } = req.body;
    const image = req.file ? req.file.filename : null;
    const newProduct = new ProductModel({ name, weight, pieces, boxWeight, boxPrice, rating, quantity, image });
    await newProduct.save();
    res.status(201).json({ message: 'Fruit added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add fruit' });
  }
});

app.get('/api/fruits', async (req, res) => {
  try {
    const fruits = await ProductModel.find();
    res.json(fruits);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/fruits/:id', async (req, res) => {
  try {
    const deleted = await ProductModel.findByIdAndDelete(req.params.id);
    if (deleted && deleted.image) {
      const filePath = path.join(uploadsDir, deleted.image);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.json({ message: 'Fruit deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Newsletter
app.post('/api/newsletter', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  try {
    const exists = await NewsletterModel.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Already subscribed' });
    const newEntry = new NewsletterModel({ email });
    await newEntry.save();
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/newsletter', async (req, res) => {
  try {
    const emails = await NewsletterModel.find();
    res.status(200).json(emails);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ Banner Upload
app.post('/api/banner', upload.single('banner'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const imageUrl = `${DOMAIN}/uploads/${req.file.filename}`;
  try {
    const newBanner = new BannerModel({ imageUrl });
    await newBanner.save();

    const allBanners = await BannerModel.find().sort({ createdAt: 1 });
    if (allBanners.length > 5) {
      const toDelete = allBanners.slice(0, allBanners.length - 5);
      for (const banner of toDelete) {
        const filePath = path.join(uploadsDir, path.basename(banner.imageUrl));
        fs.unlink(filePath, (err) => err && console.error(err));
        await BannerModel.findByIdAndDelete(banner._id);
      }
    }

    res.status(201).json({ message: 'Banner uploaded', imageUrl });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/banners', async (req, res) => {
  try {
    const banners = await BannerModel.find().sort({ createdAt: 1 });
    res.status(200).json(banners);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ Orders
app.post('/api/order', async (req, res) => {
  try {
    const { name, address, phone, cartItems } = req.body;

    if (!name || !address || !phone || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const items = cartItems.map(item => ({
      name: item.name,
      quantity: item.quantity,
      pricePerKg: item.boxPrice,
      totalCost: item.quantity * item.boxPrice,
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.totalCost, 0);

    const order = new OrderModel({
      name,
      address,
      phone,
      items,
      totalAmount,
      orderedAt: new Date(),
    });

    await order.save();
    res.status(201).json({ message: 'Order saved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/api/order', async (req, res) => {
  try {
    const orders = await OrderModel.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Dashboard Summary
app.get('/api/dashboard', async (req, res) => {
  try {
    const totalOrders = await OrderModel.countDocuments();
    const totalUsers = await RegisterModel.countDocuments();
    const totalItems = await ProductModel.countDocuments();
    const totalIncome = await OrderModel.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    res.json({
      totalIncome: totalIncome[0]?.total || 0,
      totalOrders,
      totalUsers,
      totalItems
    });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ Recent members
app.get('/api/members', async (req, res) => {
  try {
    const recentMembers = await RegisterModel.find({}, 'firstName lastName email phone').sort({ _id: -1 }).limit(10);
    res.json(recentMembers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching members' });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on ${DOMAIN}`);
});
