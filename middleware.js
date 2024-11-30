// middleware.js

// Import necessary modules
const fs = require('fs'); // File system module for interacting with the file system
const path = require('path'); // Path module for handling and transforming file paths

// Middleware to log incoming requests
const requestLogger = (req, res, next) => {
    // Log the HTTP method and URL of the request
    console.log(`${req.method} ${req.url}`); 
    next(); // Call the next middleware in the stack
};

// Middleware to handle lesson image requests
const lessonImageMiddleware = (db) => async (req, res, next) => {
    try {
        // Extract the lesson ID from the request URL parameters
        const lessonId = req.params.id; // This assumes the ID is part of the URL, adjust if necessary

        // Fetch the lesson from the database using the provided lesson ID
        const lesson = await db.collection('lessons').findOne({ _id: new ObjectId(lessonId) });

        // If the lesson is not found, respond with a 404 error
        if (!lesson) {
            return res.status(404).json({ error: 'Lesson not found' });
        }

        // Construct the file path to the requested image using the image field from the lesson
        const imagePath = path.join(__dirname, lesson.image); // __dirname refers to the directory of the current module

        // Check if the image file exists in the file system
        fs.access(imagePath, fs.constants.F_OK, (err) => {
            if (err) {
                // If the file does not exist, respond with a 404 error
                return res.status(404).json({ error: 'Image not found' });
            }
            // If the file exists, call the next middleware in the stack
            next();
        });
    } catch (error) {
        // Handle any errors that occur during the process
        return res.status(500).json({ error: 'Error fetching lesson', message: error.message });
    }
};

// Export the middleware functions for use in other modules
module.exports = { requestLogger, lessonImageMiddleware };