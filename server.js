// server.js
const express = require('express');
const dotenv = require('cors');
const mongoose = require('mongoose');
const app = express();

// Middleware
app.use(cors()); // enables CORS for all routes
app.use(express.json()); //parses incoming JSON requests

// Database Connection
mongoose.connect('my-mongodb-connection', {/*MAKE THE CONECTION */
    useNewUrlPARSER: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('MongoDB connection error:', error));


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
