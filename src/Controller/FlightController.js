const flightService = require('../Service/flightService');

class FlightController {
    async searchFlights(req, res, next) {
        const startTime = Date.now();
        try {
            const { from, to, departureDate } = req.query;

            // Mandatory query parameters validation
            if (!from || !to || !departureDate) {
                return res.status(400).json({
                    error: 'Mandatory parameters missing: from, to, departureDate'
                });
            }

            const result = await flightService.searchFlights(req.query);

            if (!result.flights || result.flights.length === 0) {
                return res.status(404).json({
                    message: 'No flights found for the given criteria'
                });
            }

            const responseTime = Date.now() - startTime;
            console.log(`Search request processed in ${responseTime}ms`);

            return res.status(200).json({
                success: true,
                count: result.totalCount,
                responseTime: `${responseTime}ms`,
                data: result.flights,
                pagination: {
                    total: result.totalCount,
                    page: result.page,
                    limit: result.limit
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async triggerIngestion(req, res, next) {
        try {
            await flightService.ingestData();
            res.status(200).json({ message: 'Data ingestion triggered successfully' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new FlightController();
