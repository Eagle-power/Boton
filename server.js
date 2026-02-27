const express = require('express');
const morgan = require('morgan');
const connectDB = require('./src/Config/db');
const flightRoutes = require('./src/Routes/flightRoutes');
const errorHandler = require('./src/Middleware/errorHandler');
const flightService = require('./src/Service/flightService');
require('dotenv').config();

const app = express();

// Connect to Database
connectDB();

// Middlewares
app.use(express.json());
app.use(morgan('dev')); // Logging

// Routes
app.use('/api/flights', flightRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('Flight Search API is running...');
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);

    // Initial data ingestion
    console.log('Initiating initial data ingestion...');
    await flightService.ingestData();
});
