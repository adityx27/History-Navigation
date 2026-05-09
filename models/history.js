const mongoose = require('mongoose');
const historySchema = new mongoose.Schema({
    url:{
        type: String,
        required: true
    },
    visitedAt:{
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('History', historySchema);