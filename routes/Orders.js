const express = require('express');
const { Order, Product } = require('../models/database');
const mongoose = require('mongoose');
const router = express.Router();

// POST /orders
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

        const product = await Product.findById(lessonID);
        if (!product) {
            return res.status(404).json({ message: `Lesson with ID ${lessonID} not found.` });
        }

        // Check Availability
        if (product.space < quantity) {
            return res.status(400).json({ 
                message: `Not enough space available for lesson: ${product.name}.` 
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
