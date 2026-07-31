const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.expressjson = express.json();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statik Dosyaları Sunma (Frontend için)
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Veritabanı Bağlantısı (Environment variable üzerinden veya doğrudan Atlas URI)
const MONGO_URI = process.env.MONGO_URI || "YEREL_VEYA_ATLAS_MONGODB_BAGLANTI_ADRESINIZ";

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB veritabanı bağlantısı başarıyla kuruşdu."))
.catch(err => console.error("MongoDB bağlantı hatası:", err));

// 1. Şirket ve Sistem Ayarları Şeması
const settingsSchema = new mongoose.Schema({
    businessName: { type: String, default: "Hayel Müzik 37 & Bakkal" },
    taxNo: { type: String, default: "1234567890" },
    ownerPhone: { type: String, default: "05000000000" },
    adminPass: { type: String, default: "1234" },
    cashierPass: { type: String, default: "5678" },
    iban: { type: String, default: "TR33 0006 1005 2198 6742 3300 01" }
});
const Settings = mongoose.model('Settings', settingsSchema);

// 2. Ürün ve Stok Şeması
const productSchema = new mongoose.Schema({
    barcode: String,
    name: { type: String, required: true },
    unit: { type: String, default: "Adet" },
    cost: { type: Number, default: 0 },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 }
});
const Product = mongoose.model('Product', productSchema);

// 3. Müşteri ve Veresiye Şeması
const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    apartment: String,
    phone: String,
    limit: { type: Number, default: 1000 },
    balance: { type: Number, default: 0 },
    purchasedItems: [{
        name: String,
        qty: Number,
        unit: String,
        price: Number,
        time: String
    }]
});
const Customer = mongoose.model('Customer', customerSchema);

// API Rotaları - Ayarlar
app.get('/api/settings', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
            await settings.save();
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/settings', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings(req.body);
        } else {
            Object.assign(settings, req.body);
        }
        await settings.save();
        res.json({ success: true, settings });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API Rotaları - Ürünler
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.json({ success: true, product: newProduct });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API Rotaları - Müşteriler
app.get('/api/customers', async (req, res) => {
    try {
        const customers = await Customer.find();
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/customers', async (req, res) => {
    try {
        const newCustomer = new Customer(req.body);
        await newCustomer.save();
        res.json({ success: true, customer: newCustomer });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Sunucuyu Başlatma
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} numaralı port üzerinde çalışıyor.`);
});