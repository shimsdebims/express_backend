// Import required modules
const express = require('express'); // Framework for building web applications
const { MongoClient } = require('mongodb'); // MongoDB driver for Node.js
const cors = require('cors'); // Middleware to enable Cross-Origin Resource Sharing
const path = require('path'); // Built-in Node.js module to handle file paths
const morgan = require('morgan'); // Middleware for logging HTTP requests
require('dotenv').config();
const DB_NAME = process.env.DB_NAME;

// Create an Express app
const app = express();
const PORT = process.env.PORT || 3001; //PORT NUMBER
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})

// MongoDB connection 
const MONGODB_URI = process.env.MONGODB_URI;
let db; // MongoDB connection variable

// Function to connect to MongoDB
async function connectToDatabase() {
  try {
    const client = new MongoClient(MONGODB_URI); // Initialize MongoDB client
    await client.connect(); // Connect to MongoDB server
    console.log('Connected to MongoDB');
    db = client.db(DB_NAME); // Assign the database instance to the `db` variable
  } catch (error) {
    console.error('Failed to connect to MongoDB', error); // Log any connection errors
    process.exit(1); // Exit the application if unable to connect to MongoDB
  }
}


// Middleware
app.use(cors({
  origin: [
    'https://github.com/shimsdebims/express_backend',
    'http://localhost:3001',
    'http://localhost:8080'
  ]
})); // Enable CORS for all incoming requests
app.use(express.json()); // Middleware to parse incoming JSON request bodies
app.use(morgan('dev')); // Logs HTTP requests to the console in 'dev' format

// Static file middleware for serving lesson images
// Serve images from a specific directory
app.use('/images', express.static(path.join(__dirname, 'images'), {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
      res.setHeader('Content-Type', `image/${ext.slice(1)}`);
    }
  }
}));

// Serve Vue.js frontend application
app.use(express.static(path.join(__dirname, 'public'))); // Serve files from the 'public' directory


// Function to connect to MongoDB
async function connectToDatabase() {
  try {
    const client = new MongoClient(MONGODB_URI); // Initialize MongoDB client
    await client.connect(); // Connect to MongoDB server
    console.log('Connected to MongoDB');
    db = client.db(DB_NAME); // Assign the database instance to the `db` variable
  } catch (error) {
    console.error('Failed to connect to MongoDB', error); // Log any connection errors
    process.exit(1); // Exit the application if unable to connect to MongoDB
  }
}

// GET route to fetch all lessons
app.get('/Lessons', async (req, res) => {
  try {
    console.log('Lessons route hit'); // Log the route being accessed
    const Lessons = await db.collection('Lessons').find({}).toArray(); // Fetch all documents in the 'Lessons' collection
    console.log('Lessons found:', Lessons); // Log the retrieved lessons
    res.json(Lessons); // Send lessons as a JSON response
  } catch (error) {
    console.error('Error fetching Lessons:', error); // Log errors
    res.status(500).json({ message: 'Error fetching Lessons', error: error.message }); // Send error response
  }
});

// GET route to search for lessons based on query parameters
app.get('/search', async (req, res) => {
  try {
    const { query } = req; // Extract query parameters from the request
    const searchTerm = query.q; // Assume the search term is passed as 'q'

    console.log('Search term:', searchTerm); // Log the search term

    // Perform a search in the 'Lessons' collection
    const lessons = await db.collection('Lessons').find({
      $or: [ // Match lessons where any of the following fields match the search term
        { topic: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive search in 'topic'
        { location: { $regex: searchTerm, $options: 'i' } }, // Search in 'location'
        { price: { $regex: searchTerm, $options: 'i' } }, // Search in 'price'
        { space: { $regex: searchTerm, $options: 'i' } } // Search in 'space'
      ]
    }).toArray();

    console.log('Search results:', lessons); // Log the search results
    res.json(lessons); // Send the search results as JSON
  } catch (error) {
    console.error('Error searching lessons:', error); // Log errors
    res.status(500).json({ message: 'Error searching lessons', error: error.message }); // Send error response
  }
});

// POST route to save a new order
app.post('/Orders', async (req, res) => {
  try {
    const newOrder = req.body; // Extract order details from the request body
    const result = await db.collection('Orders').insertOne(newOrder); // Insert new order into the 'Orders' collection
    res.status(201).json(result); // Send insertion result with status 201 (Created)
  } catch (error) {
    console.error('Error saving order:', error); // Log errors
    res.status(500).json({ message: 'Error saving order', error: error.message }); // Send error response
  }
});

// PUT route to update the available spaces for a lesson
app.put('/Lessons/:id', async (req, res) => {
  try {
    const { id } = req.params; // Extract lesson ID from the request parameters
    const { space } = req.body; // Extract the updated space value from the request body
    const result = await db.collection('Lessons').updateOne(
      { _id: new MongoClient.ObjectId(id) }, //  ObjectId conversion
      { $set: updateData } // Use $set to update multiple fields
    );

    res.json(result); // Send the update result as JSON
  } catch (error) {
    console.error('Error updating lesson:', error); // Log errors
    res.status(500).json({ message: 'Error updating lesson', error: error.message }); // Send error response
  }
});

// Function to start the server
async function startServer() {
  await connectToDatabase(); // Connect to the database before starting the server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`); // Log that the server is running
  });
}

// Start the server
startServer();
