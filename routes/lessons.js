// routes/lessons.js
const express = require('express');
const { Product, Order } = require('../models/database');
const router = express.Router();

// Fetch all products (lessons)
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// Create a new order
router.post('/orders', async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        const newOrder = new Order({ productId, quantity });
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ message: 'Error creating order' });
    }
});

module.exports = router;
