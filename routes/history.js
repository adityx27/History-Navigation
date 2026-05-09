const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const History = require('../models/history');

let historyArray = [];
let currentIndex = -1;

const getCurrentUrl = () => {
    if (currentIndex < 0 || currentIndex >= historyArray.length) {
        return '';
    }
    return historyArray[currentIndex].url;
};

const historyResponse = (extra = {}) => ({
    history: historyArray,
    currentUrl: getCurrentUrl(),
    currentIndex,
    ...extra,
});

router.post('/visit', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url || typeof url !== 'string') {
            return res.status(400).json(historyResponse({ error: 'URL is required.' }));
        }

        historyArray = historyArray.slice(0, currentIndex + 1);
        historyArray.push({ url, id: Date.now().toString(), timestamp: Date.now() });
        currentIndex = historyArray.length - 1;

        if (mongoose.connection?.readyState === 1) {
            const newHistory = new History({ url });
            await newHistory.save();
        }

        res.json(historyResponse());
    } catch(err) {
        res.status(500).json(historyResponse({ error: 'Could not save history entry.' }));
    }
});

router.get('/current', (req, res) => {
    res.json(historyResponse());
});

router.post('/back', (req, res) => {
    if (currentIndex <= 0) {
        return res.json(historyResponse());
    }

    currentIndex--;
    res.json(historyResponse());
});

router.post('/front', (req, res) => {
    if (currentIndex >= historyArray.length - 1) {
        return res.json(historyResponse());
    }

    currentIndex++;
    res.json(historyResponse());
});

router.post('/close', (req, res) => {
    try {
        const { id } = req.body;
        if (!id || typeof id !== 'string') {
            return res.status(400).json(historyResponse({ error: 'History item id is required.' }));
        }

        const deleteIndex = historyArray.findIndex((item) => item.id === id);
        if (deleteIndex === -1) {
            return res.status(404).json(historyResponse({ error: 'History item not found.' }));
        }

        historyArray = historyArray.filter((item) => item.id !== id);

        if (historyArray.length === 0) {
            currentIndex = -1;
        } else if (deleteIndex < currentIndex) {
            currentIndex--;
        } else if (deleteIndex === currentIndex) {
            currentIndex = Math.min(currentIndex, historyArray.length - 1);
        }

        res.json(historyResponse());
    } catch(err) {
        res.status(500).json(historyResponse({ error: 'Could not delete history item.' }));
    }
});

module.exports = router;