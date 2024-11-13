// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); //to load environments
const app = express();

// Middleware
app.use(cors()); // enables CORS for all routes
app.use(express.json()); //parses incoming JSON requests


// Database Connection
const mongoURI = process.env.MONGODB_URI;   //using env variable for URI
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('MongoDB connection error:', error));

// Defining Routes 
const lessonsRouter = require('./routes/lessons');
app.use('/api/lessons', lessonsRouter); // Example route setup

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

