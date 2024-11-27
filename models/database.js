// models/database.js
const mongoose = require('mongoose');

// Product schema
const productSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    space: { type: Number, default: 5 },
    image: { type: String, default: '/default-image.jpg' },
    available: { type: Boolean, default: true }
});

// Order schema

const orderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    lessonIDs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    quantity: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

module.exports = { Product, Order };
