const { Router } = require("express");
const BusesModel = require("../Models/BusesModel");
const TicketsModel = require('../Models/TicketModel');
const UsersModel = require("../Models/UsersModel");
const { authToken, authUser } = require("../utils/utils");

const ticketRouter = new Router();

ticketRouter.post('/bookticket', authToken, async (req, res) => {
    try{
        let {password, busId, journeyDate, fare, seats, passengers} = req.body;
        let user = await UsersModel.findOne({_id: req.user._id});
        const userD = await authUser(user.email, password);
        if (Number(fare) > userD.wallet) {
            return res.status(400).send({message: "Insufficient wallet balance!"})
        }
        let bus = await BusesModel.findOne({_id: busId});
        let ticket = bus.tickets[journeyDate];
        for (let i = 0; i < seats.length; i++) {
            if (ticket && ticket[seats[i]] === "booked") {
                return res.status(400).send({message: "The seats you are trying book has been booked!"})
            }
        }
        const bookedTicket = new TicketsModel({
            busId,
            userId: req.user._id,
            fare,
            passengers,
            seats,
            journeyDate,
            busNumber: bus.busNumber,
            origin: bus.origin,
            destination: bus.destination
        });
        for (let i = 0; i < seats.length; i++) {
            bus.tickets[journeyDate][seats[i]] = "booked";
        }
        bus.markModified("tickets");
        userD.wallet -= Number(fare);
        await userD.save();
        await bus.save();
        let data = await bookedTicket.save();
        res.send({ticketId: data._id});
    }
    catch(e){
        res.status(400).send({ message: e.message });
    }
});

ticketRouter.post('/getticket', authToken, async (req, res) => {
    if (!req.body.ticketId) {
        return res.status(404).send({message: "Ticket Id missing!"})
    }
    try{   
        let ticket = await TicketsModel.findOne({_id: req.body.ticketId})
        if (!ticket) {
            return res.status(404).send({message: "Invalid request."})
        }
        let bus = await BusesModel.findOne({_id: ticket.busId});
        if (!bus) {
            return res.status(404).send({message: "Invalid request."})
        }
        res.send({ticket, bus});
    }
    catch(e){
        res.status(400).send({ message: e.message });
    }
});

ticketRouter.post('/getallticket', authToken, async (req, res) => {
    if (!req.body.userId) {
        return res.status(404).send("UserId missing!");
    }
    try{
        let {userId} = req.body;
        let tickets = await TicketsModel.find({userId});
        if (!tickets) {
            return res.status(404).send("No bookings for this User!");
        }
        res.send(tickets);
    }
    catch(e){
        res.status(400).send({ message: e.message });
    }
});

module.exports = ticketRouter;