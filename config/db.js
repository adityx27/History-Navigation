const mongoose = require('mongoose');

const connectDB = async() =>{
    try{
        if (!process.env.MONGO_URI) {
            console.warn('MONGO_URI is not set. Running without MongoDB.');
            return false;
        }

        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
        return true;
    } catch(error){
        console.warn('MongoDB connection failed. Running without MongoDB.');
        console.warn(error?.message ?? error);
        return false;
    }
}

module.exports = connectDB;