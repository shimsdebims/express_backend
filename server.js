// Import required modules
const express = require('express'); // Framework for building web applications
const { MongoClient, ObjectId } = require('mongodb'); // MongoDB driver for Node.js
const cors = require('cors'); // Middleware to enable Cross-Origin Resource Sharing
const path = require('path'); // Built-in Node.js module to handle file paths
const morgan = require('morgan'); // Middleware for logging HTTP requests
require('dotenv').config();
const DB_NAME = process.env.DB_NAME;
const PORT = process.env.PORT || 10000; //PORT NUMBER

// Create an Express app
const app = express();
// MongoDB connection 
const MONGODB_URI = process.env.MONGODB_URI; 
let db; // MongoDB connection variable

// Function to connect to MongoDB
async function connectToDatabase() {
  try {
      const client = new MongoClient(MONGODB_URI);
      await client.connect();
      console.log('Connected to MongoDB');
      db = client.db(DB_NAME);
  } catch (error) {
      console.error('Failed to connect to MongoDB:', error.message);
      process.exit(1);
  }
}

// 
const allowedOrigins = [
  'https://shimsdebims.github.io', // GitHub Pages
  'http://localhost:8080', // Local testing (optional)
];

const corsOptions = {
  origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
      } else {
          callback(new Error('Not allowed by CORS'));
      }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.use(async (req, res, next) => {
  if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
  }
  next();
});


// Add a preflight handler for OPTIONS requests
app.options('*', cors());
 // Enable CORS for all incoming requests
app.use(express.json()); // Middleware to parse incoming JSON request bodies
app.use(morgan('dev')); // Logs HTTP requests to the console in 'dev' format
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// GET route to fetch all lessons
app.get('/Lessons', async (req, res) => {
  try {
      console.log('Fetching lessons...');
      const Lessons = await db.collection('Lessons').find({}).toArray();
      console.log('Lessons found:', Lessons);
      res.json(Lessons);
  } catch (error) {
      console.error('Error fetching Lessons:', error);
      res.status(500).json({ message: 'Error fetching Lessons', error: error.message });
  }
});


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
      const newOrder = req.body;

      // Add a timestamp
      newOrder.createdAt = new Date();

      const result = await db.collection('Orders').insertOne(newOrder);

      res.status(201).json({
          message: 'Order placed successfully',
          orderId: result.insertedId
      });
  } catch (error) {
      console.error('Error saving order:', error);
      res.status(500).json({ message: 'Error saving order', error: error.message });
  }
});


// PUT route to update the available spaces for a lesson
app.put('/Lessons/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const { space } = req.body; // Extract 'space' from request body

      // Perform the update
      const result = await db.collection('Lessons').updateOne(
        { _id: ObjectId(id) }, // Use ObjectId from MongoDB
        { $set: { space } }
    );

      res.json(result);
  } catch (error) {
      console.error('Error updating lesson:', error);
      res.status(500).json({ message: 'Error updating lesson', error: error.message });
  }
});


// Function to start the server
async function startServer() {
  await connectToDatabase(); // Connect to the database before starting the server
  app.listen(process.env.PORT || 10000, () => {
    console.log('Server is running on PORT:10000');
  });
}

// Start the server
startServer();
