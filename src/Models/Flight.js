const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
    airline: { type: String, required: true },
    flightNumber: { type: String, required: true },
    from: { type: String, required: true, index: true },
    to: { type: String, required: true, index: true },
    departureDate: { type: String, required: true, index: true },
    departureTime: { type: String, required: true },
    arrivalDate: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    price: { type: Number, required: true },
    departureDateTime: { type: Date, required: true },
    arrivalDateTime: { type: Date, required: true }
}, {
    timestamps: true
});

// Calculate Date objects for sorting and filtering
flightSchema.pre('save', function (next) {
    this.departureDateTime = new Date(`${this.departureDate}T${this.departureTime}`);
    this.arrivalDateTime = new Date(`${this.arrivalDate}T${this.arrivalTime}`);
    next();
});

const Flight = mongoose.model('Flight', flightSchema);

module.exports = Flight;
