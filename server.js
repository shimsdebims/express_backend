// server.js
const express = require('express');
const dotenv = require('cors');
const mongoose = require('mongoose');
const app = express();

// Middleware
app.use(cors()); // enables CORS for all routes
app.use(express.json()); //parses incoming JSON requests

const mongoURI = 'mongodb+srv://shimsdebims:mBIv22QHR5Kg0zVP@cluster0.3576s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

// Database Connection
mongoose.connect(mongoURI, {/*MAKE THE CONECTION */
    useNewUrlPARSER: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('MongoDB connection error:', error));

// Define Routes (e.g., your API routes in `routes/lessons.js`)
const lessonsRouter = require('./routes/lessons');
app.use('/api/lessons', lessonsRouter); // Example route setup

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

const lessonRoutes = require('./routes/lessons');
app.use ('/api', lessonRoutes);