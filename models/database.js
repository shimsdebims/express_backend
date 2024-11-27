// models/database.js
const mongoose = require('mongoose');

// Product schema
const productSchema = new mongoose.Schema({
    subject: String,
    location: String,
    price: Number,
    available: Boolean,
});

// Order schema
const orderSchema = new mongoose.Schema({
    productId: mongoose.Schema.Types.ObjectId,
    quantity: Number,
    date: { type: Date, default: Date.now },
});

const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

module.exports = { Product, Order };
