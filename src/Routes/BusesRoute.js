const { Router } = require("express");
const BusesModel = require("../Models/BusesModel");
const { authToken } = require("../utils/utils");

const busRouter = new Router();

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
    const arrUniq = [...new Map(location.map(v => [v.value, v])).values()]
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


module.exports = busRouter;
