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

// MongoDB Bağlantı Adresi
const MONGO_URI = "mongodb+srv://bariscaneer_db_user:bakkal1234@yolcu.o1or6se.mongodb.net/bakkalDB?appName=yolcu"; 

// MongoDB Bağlantısı (Yalın ve kararlı bağlantı)
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Veritabanına Bağlandı!"))
  .catch((err) => console.log("Bağlantı hatası:", err));

// --- Veritabanı Modelleri (Örnek Şemalar) ---
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
// Ürünleri listeleme
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Müşterileri listeleme
app.get('/api/customers', async (req, res) => {
    try {
        const customers = await Customer.find();
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- KÖK DİZİN (/) YÖNLENDİRMESİ ("Not Found" Hatasını Çözen Kısım) ---
app.get('/', (req, res) => {
    // Projenizde public klasörü içinde index.html olduğunu varsayarak yönlendiriyoruz
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Sunucuyu Başlatma
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});