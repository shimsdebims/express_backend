// server.js
const { MongoClient, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const { requestLogger, lessonImageMiddleware } = require('./middleware');
require('dotenv').config();

const app = express();

//midleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(lessonImageMiddleware);
app.use(requestLogger);

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI;
let db;

MongoClient.connect(mongoURI, { useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to MongoDB');
        db = client.db('afterSchoolApp'); // Set the database
     // Start Server after successful DB connection
        const PORT = process.env.PORT || 8080;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
     });
    })

    .catch(err => console.error('MongoDB connection error:', err));

// Validation Functions
const validateOrder = (req, res, next) => {
    const { name, phoneNumber, lessonIDs, quantity } = req.body;
    
    // Name validation (letters only)
    if (!/^[a-zA-Z\s]+$/.test(name)) {
        return res.status(400).json({ error: 'Name must contain only letters' });
    }
    
    // Phone number validation (10 digits)
    if (!/^\d{10}$/.test(phoneNumber)) {
        return res.status(400).json({ error: 'Phone number must be 10 digits' });
    }
    
    next();
};

// Routes

app.get('/lessons', async (req, res) => {
    try {
        const lessons = await db.collection('lessons').find().toArray(); // Fetching lessons
        res.json(lessons);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching lessons', error: error.message });
    }
});

app.get('/lessons/:id', async (req, res) => {
    try {
        const { id } = req.params; // Get the lesson ID from the URL
        const lesson = await db.collection('lessons').findOne({ _id: new ObjectId(id) }); // Fetch the lesson

        if (!lesson) {
            return res.status(404).json({ error: 'Lesson not found' });
        }

        res.json(lesson); // Send the lesson data back to the client
    } catch (error) {
        res.status(500).json({ message: 'Error fetching lesson', error: error.message });
    }
});

app.post('/Orders', validateOrder, async (req, res) => {
    try {
        const { name, phoneNumber, lessonIDs, quantity } = req.body;
        
        // Check lesson availability
        const lessons = await db.collection('lessons').find({
            _id: { $in: lessonIDs.map(id => new ObjectId(id)) }
        }).toArray();
        
        const unavailableLessons = lessons.filter(lesson => lesson.space < quantity);
        
        if (unavailableLessons.length > 0) {
            return res.status(400).json({ 
                error: 'Insufficient spaces',
                unavailableLessons: unavailableLessons.map(l => l.subject)
            });
        }
        
        // Create order
        const OrderResult = await db.collection('Orders').insertOne({
            name, phoneNumber, lessonIDs, quantity
        });
        
        // Update lesson spaces
        for (const lessonId of lessonIDs) {
            await db.collection('lessons').updateOne(
                { _id: new ObjectId(lessonId) },
                { $inc: { space: -quantity } }
            );
        }
        
        res.status(201).json(OrderResult);
    } catch (error) {
        res.status(500).json({ error: 'Order creation failed' });
    }
});


app.put('/lessons/:id', async (req, res) => {
    const { id } = req.params;
    const { space } = req.body;
    try {
        const updatedLesson = await db.collection('lessons').findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { space } },
            { returnOriginal: false }
        );
        res.json(updatedLesson.value);
    } catch (error) {
        res.status(500).json({ message: 'Error updating lesson', error: error.message });
    }
});


// Search Functionality
app.get('/search', async (req, res) => {
    const { query } = req.query;
    try {
        const lessons = await db.collection('lessons').find({
            $or: [
                { subject: { $regex: query, $options: 'i' } },
                { location: { $regex: query, $options: 'i' } },
                { price: { $regex: query, $options: 'i' } },
                { space: { $regex: query, $options: 'i' } }
            ]
        }).toArray();
        res.json(lessons);
    } catch (error) {
        res.status(500).json({ message: 'Error searching lessons', error: error.message });
    }
});

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});