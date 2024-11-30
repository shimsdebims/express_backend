// middleware/simpleMiddleware.js
const path = require('path');
const fs = require('fs');

// Simple console logger middleware
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log('\n=== New Request ===');
    console.log(`Timestamp: ${timestamp}`);
    console.log(`Method: ${req.method}`);
    console.log(`URL: ${req.url}`);
    console.log('Headers:', req.headers);
    
    if (Object.keys(req.body).length > 0) {
        console.log('Body:', req.body);
    }
    
    console.log('=== End Request ===\n');
    next();
};

// Static file middleware for lesson images
const lessonImageMiddleware = (req, res, next) => {
    if (!req.url.startsWith('/images/')) {
        return next();
    }

    const imagePath = path.join(__dirname, '..', 'public', req.url);
    
    fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.log(`Image not found: ${req.url}`);
            return res.status(404).json({
                error: 'Image not found',
                message: `The requested image ${req.url} does not exist`
            });
        }
        
        res.sendFile(imagePath);
    });
};

//ensuring proper exports
module.exports = {
    requestLogger,
    lessonImageMiddleware
};