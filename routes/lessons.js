// routes/lessons.js
const express = require('express');
const { Product, Order } = require('../models/database.js');
const router = express.Router();

// Fetch all products (lessons)

router.get('/products', async (req, res) => {
    try {
        console.log('Fetching products...');
        const products = await Product.find();
        console.log('Products found:', products);
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products', error: error.message });
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
