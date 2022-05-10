const Mongoose = require("mongoose");

const BusSchema = new Mongoose.Schema({
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
    },
    busType: {
        type: String,
        required: true
    },
    journeyTime: {
        type: String,
        required: true
    },
    journeyClass: {
        type: String,
        required: true
    },
    distance: {
        type: String,
        required: true
    },
    departureTime: {
        type: String,
        required: true
    },
    arrivalTime: {
        type: String,
        required: true
    },
    tickets: {
        type: Object,
        required: true
    },
    fare: {
        type: Number,
        required: true
    }
});

//This method runs while sending response.
// BusSchema.methods.toJSON = function(){
//     const user = this;
//     const dataObject = user.toObject();

//     delete dataObject._id;

//     return dataObject;
// }


const BusesModel = Mongoose.model("buses", BusSchema);

module.exports = BusesModel;