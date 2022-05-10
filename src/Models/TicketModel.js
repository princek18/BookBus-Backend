const Mongoose = require("mongoose");

const TicketSchema = new Mongoose.Schema({
    userId: {
        type: Mongoose.Types.ObjectId,
        required: true
    },
    busId: {
        type: Mongoose.Types.ObjectId,
        required: true
    },
    fare: {
        type: Number,
        required: true
    },
    passengers: {
        type: Array,
        required: true
    },
    seats: {
        type: Array,
        required: true
    },
    journeyDate: {
        type: String,
        required: true
    },
    busNumber: {
        type: String,
        required: true
    },
    origin: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    }
})

const TicketsModel = Mongoose.model("tickets", TicketSchema);

module.exports = TicketsModel;