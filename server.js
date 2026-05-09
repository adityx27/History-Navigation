require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const historyRoutes = require('./routes/history');

const app = express();

// ✅ middleware FIRST
app.use(cors({ origin: '*' }));
app.use(express.json());

// ✅ routes AFTER
app.use('/api/history', historyRoutes);

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`server is running on port ${PORT}`);
});