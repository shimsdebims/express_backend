// middleware.js
const fs = require('fs');
const path = require('path');

const requestLogger = (req, res, next) => {
    console.log(`${req.method} ${req.url}`); // Log the request method and URL
    next(); // Call the next middleware
};

const lessonImageMiddleware = async (req, res, next) => {
    try {
        // Extract the lesson ID from the request URL (assuming the ID is part of the URL)
        const lessonId = req.params.id; // Adjust this based on your route structure

        // Fetch the lesson from the database
        const lesson = await db.collection('lessons').findOne({ _id: new ObjectId(lessonId) });

        if (!lesson) {
            return res.status(404).json({ error: 'Lesson not found' });
        }

        // Construct the path to the requested image file
        const imagePath = path.join(__dirname, lesson.image); // Use the image field from the lesson

        // Check if the file exists
        fs.access(imagePath, fs.constants.F_OK, (err) => {
            if (err) {
                // If the file does not exist, respond with a 404 error
                return res.status(404).json({ error: 'Image not found' });
            }
            // If the file exists, call the next middleware
            next();
        });
    } catch (error) {
        return res.status(500).json({ error: 'Error fetching lesson', message: error.message });
    }
};

module.exports = { requestLogger, lessonImageMiddleware };