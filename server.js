// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); //to load environments
const { requestLogger, lessonImageMiddleware } = require('./middleware/simpleMiddleware');


const app = express();
// Middleware
app.use(cors()); // enables CORS for all routes
app.use(express.json()); //parses incoming JSON requests
app.use(requestLogger);  //  simple console logger
app.use(lessonImageMiddleware);  //  image handling middleware


// Database Connection
const mongoURI = process.env.MONGODB_URI;   //using env variable for URI
mongoose.connect(mongoURI)
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((error) => {console.error('MongoDB connection error:', error);
    process.exit(1); //exits process with failure if MongoDB connection fails
})

//Handling MongoDB connection events
mongoose.connection.on('error', err =>{
    console.error('MongoDB error occured:', err);
});
mongoose.connection.on('disconnected', () =>{
    console.log('MongoDB disconnected. Attempting to reconnect...');
});

// Configuring and defining Routes 
const lessonsRouter = require('./routes/lessons');
app.use('/api/lessons', lessonsRouter); 

//Error handling middleware
app.use((err, req, res, next) =>{
    console.error('Error:', err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
    });
});

// Handle 404 - Keep this as the last route
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `The requested resource ${req.url} was not found on this server`
    });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

module.exports = app;