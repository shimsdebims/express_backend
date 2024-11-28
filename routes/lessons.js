// routes/lessons.js
const express = require('express');
const { lessons, Order } = require('../models/database.js');
const router = express.Router();

// Fetch all Lessons (lessons)

router.get('/lessons', async (req, res) => {
    try {
        console.log('Attempting to fetch lessons...');
        const lessons = await lessons.find();
        
        console.log('Raw lessons from database:', lessons);
        
        if (lessons.length === 0) {
            console.log('No lessons found in the database');
            return res.status(404).json({ message: 'No lessons found' });
        }
        // Transformed lessons to match front-end expectations
        const formattedlessons = lessons.map(lessons => ({
            _id: lessons._id,
            subject: lessons.subject,
            location: lessons.location,
            price: lessons.price,
            space: lessons.space,
            image: lessons.image || '/default-image.jpg'
        }));
        res.json(formattedlessons);
        
    } catch (error) {
        console.error('Error fetching lessons:', error);
        res.status(500).json({ message: 'Error fetching lessons', error: error.message });
    }
});

// Create a new order
router.post('/orders', async (req, res) => {
    const { lessonsId, quantity } = req.body;
    try {
        const newOrder = new Order({ lessonsId, quantity });
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ message: 'Error creating order' });
    }
});

module.exports = router;
