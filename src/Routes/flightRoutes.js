const express = require('express');
const router = express.Router();
const flightController = require('../Controller/flightController');

// GET /api/flights/search
router.get('/search', flightController.searchFlights);

// Optional: Manual trigger for ingestion
router.post('/ingest', flightController.triggerIngestion);

module.exports = router;
