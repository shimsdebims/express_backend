const mongoose = require('mongoose');
// Create models

// Product schema
const lessonsSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    space: { type: Number, required: true },
    image: { type: String, required: true },
    subject: { type: String, required: true }
}, {
    timestamps: true,
});
const lessons = mongoose.model('Lessons', lessonsSchema);

// Order schema
const orderSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    lessonsId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'lessons' },
    quantity: { type: Number, required: true, min: 1, max: 10 }
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = { lessons, Order };