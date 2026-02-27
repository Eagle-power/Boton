const axios = require('axios');
const Flight = require('../Models/Flight');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 120 }); // 2 minutes caching

class FlightService {
    async ingestData() {
        try {
            console.log('Fetching mock data...');
            const response = await axios.get(process.env.MOCK_API_URL);
            const flights = response.data;

            console.log(`Ingesting ${flights.length} flights into MongoDB...`);

            // Using upsert logic based on flightNumber and departureDateTime to avoid duplicates
            const operations = flights.map(flight => {
                const departureDateTime = new Date(`${flight.departureDate}T${flight.departureTime}`);
                const arrivalDateTime = new Date(`${flight.arrivalDate}T${flight.arrivalTime}`);

                return {
                    updateOne: {
                        filter: { flightNumber: flight.flightNumber, departureDateTime: departureDateTime },
                        update: { ...flight, departureDateTime, arrivalDateTime },
                        upsert: true
                    }
                };
            });

            await Flight.bulkWrite(operations);
            console.log('Data ingestion complete.');
        } catch (error) {
            console.error('Data ingestion failed:', error.message);
        }
    }

    async searchFlights(queryParams) {
        const {
            from, to, departureDate,
            arrivalDate, airline,
            minPrice, maxPrice,
            departureAfter, arrivalBefore,
            sort, page = 1, limit = 2
        } = queryParams;

        // Mandatory fields check is done in controller
        const query = {
            from: from.toUpperCase(),
            to: to.toUpperCase(),
            departureDate: departureDate
        };

        // Optional filters
        if (arrivalDate) query.arrivalDate = arrivalDate;
        if (airline) query.airline = new RegExp(airline, 'i');

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        if (departureAfter) {
            const timeDate = new Date(`${departureDate}T${departureAfter}`);
            query.departureDateTime = { ...query.departureDateTime, $gte: timeDate };
        }

        if (arrivalBefore) {
            // arrivalBefore is tricky if we don't know the arrival date. 
            // If arrivalDate is provided, we use it, otherwise we check against departureDate (same day)
            const targetDate = arrivalDate || departureDate;
            const timeDate = new Date(`${targetDate}T${arrivalBefore}`);
            query.arrivalDateTime = { ...query.arrivalDateTime, $lte: timeDate };
        }

        // Sorting
        let sortOption = {};
        if (sort === 'price') sortOption = { price: 1 };
        else if (sort === 'departureTime') sortOption = { departureDateTime: 1 };
        else if (sort === 'arrivalTime') sortOption = { arrivalDateTime: 1 };
        else sortOption = { departureDateTime: 1 }; // Default sort

        // Pagination
        const skip = (page - 1) * limit;

        // Execute query
        const flights = await Flight.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit))
            .select('airline flightNumber departureDate departureTime arrivalDate arrivalTime price -_id');

        const totalCount = await Flight.countDocuments(query);

        return {
            totalCount,
            page: Number(page),
            limit: Number(limit),
            flights
        };
    }
}

module.exports = new FlightService();
