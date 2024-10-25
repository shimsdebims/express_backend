// server.js
const express = require('express');
const dotenv = require('dotenv');
const connectToDatabase = require('./models/database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Database Connection
let db;
connectToDatabase().then(database => {
    db = database;
});

// Pass database to routes
app.use((req, res, next) => {
    req.db = db;
    next();
});

// Import Routes
app.use('/api/lessons', require('./routes/lessons'));

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
