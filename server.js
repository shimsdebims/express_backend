// server.js

// Import necessary libraries and modules
const { MongoClient, ObjectId } = require('mongodb'); // MongoDB client and ObjectId for document identification
const express = require('express'); // Express framework for building web applications
const cors = require('cors'); // Middleware for enabling CORS (Cross-Origin Resource Sharing)
const { requestLogger, lessonImageMiddleware } = require('./middleware'); // Custom middleware for logging requests and handling lesson images
require('dotenv').config(); // Load environment variables from .env file

// Create an instance of an Express application
const app = express();

// Middleware setup
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse incoming JSON requests
app.use('/uploads', express.static('uploads')); // Serve static files from the 'uploads' directory
app.use(lessonImageMiddleware); // Custom middleware for handling lesson images
app.use(requestLogger); // Custom middleware for logging requests

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI; // MongoDB connection URI from environment variables
let db; // Variable to hold the database connection

// Connect to MongoDB
MongoClient.connect(mongoURI, { useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to MongoDB'); // Log successful connection
        db = client.db('afterSchoolApp'); // Set the database to 'afterSchoolApp'
        
        // Start the server after successful DB connection
        const PORT = process.env.PORT || 5001; // Use the port from environment variables or default to 5001
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`); // Log the server start message
        });
    })
    .catch(err => console.error('MongoDB connection error:', err)); // Log any connection errors

// Validation Functions
// Middleware to validate order requests
const validateOrder = (req, res, next) => {
    const { name, phoneNumber, lessonIDs, quantity } = req.body; // Destructure request body

    // Validate name (letters and spaces only)
    if (!/^[a-zA-Z\s]+$/.test(name)) {
        return res.status(400).json({ error: 'Name must contain only letters' }); // Return error if validation fails
    }

    // Validate phone number (must be exactly 10 digits)
    if (!/^\d{10}$/.test(phoneNumber)) {
        return res.status(400).json({ error: 'Phone number must be 10 digits' }); // Return error if validation fails
    }

    next(); // Proceed to the next middleware or route handler if validations pass
};

// Routes

// GET route to fetch all lessons
app.get('/lessons', async (req, res) => {
    try {
        const lessons = await db.collection('lessons').find().toArray(); // Fetch all lessons from the database
        res.json(lessons); // Send the lessons as a JSON response
    } catch (error) {
        res.status(500).json({ message: 'Error fetching lessons', error: error.message }); // Handle any errors
    }
});

// GET route to fetch a specific lesson by ID
app.get('/lessons/:id', async (req, res) => {
    try {
        const { id } = req.params; // Get the lesson ID from the URL parameters
        const lesson = await db.collection('lessons').findOne({ _id: new ObjectId(id) }); // Fetch the lesson by ID

        if (!lesson) {
            return res.status(404).json({ error: 'Lesson not found' }); // Return error if lesson is not found
        }

        res.json(lesson); // Send the lesson data back to the client
    } catch (error) {
        res.status(500).json({ message: 'Error fetching lesson', error: error.message }); // Handle any errors
    }
});

// POST route to create a new order
app.post('/Orders', validateOrder, async (req, res) => {
    try {
        const { name, phoneNumber, lessonIDs, quantity } = req.body; // Destructure request body

        // Check lesson availability by fetching lessons based on provided lesson IDs
        const lessons = await db.collection('lessons').find({
            _id: { $in: lessonIDs.map(id => new ObjectId(id)) } // Convert string IDs to ObjectId
        }).toArray();

        // Filter for lessons that do not have enough space
        const unavailableLessons = lessons.filter(lesson => lesson.space < quantity);
        
        // If any lessons are unavailable, return an error response
        if (unavailableLessons.length > 0) {
            return res.status(400).json({ 
                error: 'Insufficient spaces',
 unavailableLessons: unavailableLessons.map(l => l.subject) // List the subjects of unavailable lessons
            });
        }
        
        // Create a new order in the database
        const OrderResult = await db.collection('Orders').insertOne({
            name, phoneNumber, lessonIDs, quantity // Store order details
        });
        
        // Update the available spaces for each lesson in the order
        for (const lessonId of lessonIDs) {
            await db.collection('lessons').updateOne(
                { _id: new ObjectId(lessonId) }, // Find the lesson by ID
                { $inc: { space: -quantity } } // Decrease the space by the quantity ordered
            );
        }
        
        res.status(201).json(OrderResult); // Respond with the created order details
    } catch (error) {
        res.status(500).json({ error: 'Order creation failed' }); // Handle any errors during order creation
    }
});

// PUT route to update lesson details
app.put('/lessons/:id', async (req, res) => {
    const { id } = req.params; // Get the lesson ID from the URL parameters
    const { space } = req.body; // Get the new space value from the request body
    try {
        // Update the lesson's space in the database
        const updatedLesson = await db.collection('lessons').findOneAndUpdate(
            { _id: new ObjectId(id) }, // Find the lesson by ID
            { $set: { space } }, // Set the new space value
            { returnOriginal: false } // Return the updated document
        );
        res.json(updatedLesson.value); // Send the updated lesson data back to the client
    } catch (error) {
        res.status(500).json({ message: 'Error updating lesson', error: error.message }); // Handle any errors
    }
});

// Search Functionality
// GET route to search for lessons based on a query
app.get('/search', async (req, res) => {
    const { query } = req.query; // Get the search query from the request
    try {
        // Search for lessons that match the query in subject, location, price, or space
        const lessons = await db.collection('lessons').find({
            $or: [
                { subject: { $regex: query, $options: 'i' } }, // Case-insensitive search in subject
                { location: { $regex: query, $options: 'i' } }, // Case-insensitive search in location
                { price: { $regex: query, $options: 'i' } }, // Case-insensitive search in price
                { space: { $regex: query, $options: 'i' } } // Case-insensitive search in space
            ]
        }).toArray();
        res.json(lessons); // Send the search results back to the client
    } catch (error) {
        res.status(500).json({ message: 'Error searching lessons', error: error.message }); // Handle any errors
    }
});