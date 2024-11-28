const mongoose = require('mongoose');

// Product schema
const lessonsSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    subject: { type: String, required: true },
    price: { type: String, required: true },
    location: { type: String, required: true },
    space: { type: Boolean, required: true },
    image: { type: String, required: true }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Order schema
const orderSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    lessonsId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'lessons' },
    quantity: { type: Number, required: true, min: 1, max: 10 }
}, {
    timestamps: true
});

// Create models
const lessons = mongoose.model('lessons', lessonsSchema);
const Order = mongoose.model('Order', orderSchema);

module.exports = { lessons, Order };