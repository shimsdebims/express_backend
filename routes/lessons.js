// routes/lessons.js
const express = require('express');
const { Product, Order } = require('../models/database.js');
const router = express.Router();

// Fetch all products (lessons)

router.get('/products', async (req, res) => {
    try {
        console.log('Attempting to fetch products...');
        const products = await Product.find();
        
        console.log('Raw products from database:', products);
        
        if (products.length === 0) {
            console.log('No products found in the database');
            return res.status(404).json({ message: 'No products found' });
        }
        // Transformed products to match front-end expectations
        const formattedProducts = products.map(product => ({
            _id: product._id,
            subject: product.subject,
            location: product.location,
            price: product.price,
            space: product.space,
            image: product.image || '/default-image.jpg'
        }));
        res.json(formattedProducts);
        
        console.log('Formatted products:', formattedProducts);
        res.json(formattedProducts);
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
