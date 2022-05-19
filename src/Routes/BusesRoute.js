const { Router } = require("express");
const moment = require("moment");
const BusesModel = require("../Models/BusesModel");
const TicketsModel = require("../Models/TicketModel");
const { authToken, authAdminToken } = require("../utils/utils");

const busRouter = new Router();

let seats = [
  {
    D1: "false",
    D2: "false",
    D3: "false",
    D4: "false",
    D5: "false",
    D6: "false",
    D7: "false",
    D8: "false",
    D9: "false",
    D10: "false",
    U1: "false",
    U2: "false",
    U3: "false",
    U4: "false",
    U5: "false",
    U6: "false",
    U7: "false",
    U8: "false",
    U9: "false",
    U10: "false",
  },
  {
    L1: "false",
    L2: "false",
    L3: "false",
    L4: "false",
    L5: "false",
    L6: "false",
    L7: "false",
    L8: "false",
    L9: "false",
    L10: "false",
    L11: "false",
    L12: "false",
    L13: "false",
    L14: "false",
    L15: "false",
    L16: "false",
    L17: "false",
    L18: "false",
    L19: "false",
    L20: "false",
    R1: "false",
    R2: "false",
    R3: "false",
    R4: "false",
    R5: "false",
    R6: "false",
    R7: "false",
    R8: "false",
    R9: "false",
    R10: "false",
    R11: "false",
    R12: "false",
    R13: "false",
    R14: "false",
    R15: "false",
    R16: "false",
    R17: "false",
    R18: "false",
    R19: "false",
    R20: "false",
  },
];

busRouter.get("/getdropdwonvalues", authToken, async (req, res) => {
  try {
    let buses = await BusesModel.find({});
    if (!buses) {
      return res.status(404).send({ message: "Couldn't fetch data!" });
    }
    let location = [];
    for (let i = 0; i < buses.length; i++) {
      location.push({
        label: buses[i].origin,
        value: buses[i].origin,
      });
    }
    let busType = [
      {
        label: "Non-A/C",
        value: "Non-A/C",
      },
      {
        label: "A/C",
        value: "A/C",
      },
    ];

    let journeyClass = [
      {
        label: "Sleeper",
        value: "Sleeper",
      },
      {
        label: "Seater",
        value: "Seater",
      },
    ];
    const arrUniq = [...new Map(location.map((v) => [v.value, v])).values()];
    res.send({ location: arrUniq, busType, journeyClass });
  } catch (e) {
    res.status(400).send({ message: e.message });
  }
});

busRouter.post("/searchbuses", authToken, async (req, res) => {
  try {
    let { origin, destination, busType, journeyClass } = req.body;
    let buses = await BusesModel.find({
      origin,
      destination,
      busType,
      journeyClass,
    });
    if (buses.length < 1) {
      return res
        .status(404)
        .send({ message: "No buses for the selected Route!" });
    }
    let buses2 = [];
    for (let i = 0; i < buses.length; i++) {
      if (buses[i].tickets[req.body.journeyDate]) {
        const availableTickets = buses[i].tickets[req.body.journeyDate];
        buses2.push({
          id: buses[i]._id,
          distance: buses[i].distance,
          journeyTime: buses[i].journeyTime,
          departureTime: buses[i].departureTime,
          arrivalTime: buses[i].arrivalTime,
          busNumber: buses[i].busNumber,
          fare: buses[i].fare,
          availableTickets,
        });
      }
    }
    if (buses2.length < 1) {
      return res
        .status(404)
        .send({ message: "No buses for the selected date!" });
    }
    res.send({ user: req.body, buses: buses2 });
  } catch (e) {
    res.status(400).send({ message: e.message });
  }
});

busRouter.post("/addbus", authAdminToken, async (req, res) => {
  try {
    let {
      startDate,
      endDate,
      journeyClass,
      journeyDate,
      journeyTime,
      origin,
      destination,
      busNumber,
      departureTime,
      arrivalTime,
      distance,
      fare,
      busType,
    } = req.body;
    let tickets = {};
    if (journeyClass === "Seater") {
      for (let i = startDate; i <= endDate; i = moment(i, "YYYY-MM-DD").add(1, 'days').format('YYYY-MM-DD')) {
          tickets[i] = seats[1]
      }
    }
    else if (journeyClass === "Sleeper") {
      for (let i = startDate; i <= endDate; i = moment(i, "YYYY-MM-DD").add(1, 'days').format('YYYY-MM-DD')) {
          tickets[i] = seats[0]
      }
    }
    let data = new BusesModel({
      busNumber,
      origin,
      destination,
      distance,
      journeyClass,
      journeyDate,
      journeyTime,
      departureTime,
      arrivalTime,
      busType,
      tickets,
      fare
    });
    await data.save();
    res.send({message: "New Bus added successfully!", data});
  } 
  catch (e) {
    res.status(400).send({ message: e.message });
  }
});

busRouter.get('/getallbuses', authAdminToken, async (req, res) => {
  try{
    let buses = await BusesModel.find({});
    if (!buses) {
      return res.status(404).send({message: "Server Error!"})
    }
    for (let i = 0; i < buses.length; i++) {
      let m = "1973-10-20";
      for (const date in buses[i].tickets) {
        if (date > m) {
          m = date;
        }
      }
      buses[i].tickets = m;
    }
    res.send({buses});
  }
  catch (e) {
    res.status(400).send({ message: e.message });
  }
});

busRouter.delete('/deletebus', authAdminToken, async (req, res) => {
  try{
    if (!req.query.busId) {
      return res.status(404).send({message: "Bus Id missing!"})
    }
    let bus = await BusesModel.deleteOne({_id: req.query.busId});
    if (bus.deletedCount !== 1) {
      return res.status(404).send({message: "Invalid BusId!"})
    }
    await TicketsModel.deleteMany({busId: req.query.busId});
    res.send({message: "Bus data Deleted Successfully!"})
  }
  catch (e) {
    res.status(400).send({ message: e.message });
  }
});

busRouter.put('/extension', authAdminToken, async (req, res) => {
  try{
    let {newDate, extensionDate, busId} = req.body;
    let bus = await BusesModel.findOne({_id: busId});
    if (!bus) {
      return res.status(404).send({message: "Invalid Bus Id"});
    }
    if (bus.journeyClass === "Seater") {
      for (let i = newDate; i <= extensionDate; i = moment(i, "YYYY-MM-DD").add(1, 'days').format('YYYY-MM-DD')) {
          bus.tickets[i] = seats[1]
      }
    }
    else if (bus.journeyClass === "Sleeper") {
      for (let i = newDate; i <= extensionDate; i = moment(i, "YYYY-MM-DD").add(1, 'days').format('YYYY-MM-DD')) {
          bus.tickets[i] = seats[0]
      }
    }
    bus.markModified("tickets");
    await bus.save();
    res.send({message: `Bus extended Till ${extensionDate}.`});
  }
  catch (e) {
    res.status(400).send({ message: e.message });
  }
})

module.exports = busRouter;
