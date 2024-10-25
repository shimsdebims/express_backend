// models/database.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGODB_URI);

async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Connected to MongoDB Atlas");
        return client.db('afterSchoolApp'); // Replace with your database name
    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
        process.exit(1);
    }
}

module.exports = connectToDatabase;
