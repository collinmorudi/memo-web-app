const mongoose = require('mongoose');
require('dotenv').config();


module.exports = async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');
    } catch (error) {
        console.log('Could not connect to MongoDB...', error);
        throw error;
    }
}