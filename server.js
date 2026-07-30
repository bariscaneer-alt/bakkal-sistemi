const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
// Bulut sunucuların atayacağı portu kullanır, yoksa yerelde 3000'i seçer
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Public klasörünü (arayüzü) dış dünyaya açan kritik satır:
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Bağlantı Adresi (SSL/TLS uyumluluk parametreleri eklendi)
const MONGO_URI = "mongodb+srv://bariscaneer_db_user:bakkal1234@yolcu.o1or6se.mongodb.net/bakkalDB?retryWrites=true&w=majority&tls=true&tlsAllowInvalidCertificates=true"; 

// MongoDB Bağlantısı
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Veritabanına Bağlandı!"))
  .catch((err) => console.log("Bağlantı hatası:", err));

// --- Veritabanı Modelleri ---
const productSchema = new mongoose.Schema({
    barcode: String,
    name: String,
    unit: String,
    price: Number,
    cost: Number,
    stock: Number
});
const Product = mongoose.model('Product', productSchema);

const customerSchema = new mongoose.Schema({
    name: String,
    apartment: String,
    phone: String,
    limit: Number,
    balance: { type: Number, default: 0 },
    purchasedItems: Array
});
const Customer = mongoose.model('Customer', customerSchema);

// --- API Rotaları ---

// 1. Ürünleri Listeleme (GET)
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Yeni Ürün Ekleme / Güncelleme (POST)
app.post('/api/products', async (req, res) => {
    try {
        const { barcode, name, unit, price, cost, stock } = req.body;
        
        let product = await Product.findOne({ barcode });
        if (product) {
            product.name = name || product.name;
            product.unit = unit || product.unit;
            product.price = price !== undefined ? price : product.price;
            product.cost = cost !== undefined ? cost : product.cost;
            product.stock = stock !== undefined ? stock : product.stock;
            await product.save();
        } else {
            product = new Product({ barcode, name, unit, price, cost, stock });
            await product.save();
        }
        res.status(201).json({ message: "Ürün başarıyla kaydedildi!", product });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Müşterileri Listeleme (GET)
app.get('/api/customers', async (req, res) => {
    try {
        const customers = await Customer.find();
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Yeni Müşteri Ekleme (POST)
app.post('/api/customers', async (req, res) => {
    try {
        const { name, apartment, phone, limit, balance, purchasedItems } = req.body;
        const newCustomer = new Customer({
            name,
            apartment,
            phone,
            limit,
            balance: balance || 0,
            purchasedItems: purchasedItems || []
        });
        await newCustomer.save();
        res.status(201).json({ message: "Müşteri başarıyla kaydedildi!", newCustomer });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- KÖK DİZİN (/) YÖNLENDİRMESİ ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Sunucuyu Başlatma
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});