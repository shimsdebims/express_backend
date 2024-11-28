const express = require('express');
const { Order, lessons } = require('../models/database');
const mongoose = require('mongoose');
const router = express.Router();

// GET /api/orders
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find(); // Fetch all orders from the database
        res.json(orders); // Return the orders as JSON
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders', message: error.message });
    }
});


// POST API/orders
router.post('/orders', async (req, res) => {
    const { name, phoneNumber, lessonIDs, quantity } = req.body;

    // Validate Name
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(name)) {
        return res.status(400).json({ message: 'Invalid name. Only letters and spaces are allowed.' });
    }

    // Validate Phone Number
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
        return res.status(400).json({ message: 'Invalid phone number. Must be exactly 10 digits.' });
    }

    // Validate Lesson IDs
    if (!Array.isArray(lessonIDs) || lessonIDs.length === 0) {
        return res.status(400).json({ message: 'Lesson IDs must be a non-empty array.' });
    }

    for (const lessonID of lessonIDs) {
        if (!mongoose.Types.ObjectId.isValid(lessonID)) {
            return res.status(400).json({ message: `Invalid lesson ID: ${lessonID}` });
        }

        const lessons = await lessons.findById(lessonID);
        if (!lessons) {
            return res.status(404).json({ message: `Lesson with ID ${lessonID} not found.` });
        }

        // Check Availability
        if (lessons.space < quantity) {
            return res.status(400).json({ 
                message: `Not enough space available for lesson: ${lessons.name}.` 
            });
        }
    }

    // Validate Quantity
    if (typeof quantity !== 'number' || quantity <= 0) {
        return res.status(400).json({ message: 'Quantity must be a positive number.' });
    }

    try {
        // Save the valid order to the database
        const newOrder = new Order({ name, phoneNumber, lessonIDs, quantity });
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ message: 'Error creating order.', error });
    }
});

module.exports = router;
