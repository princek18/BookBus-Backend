const UsersModel = require("../Models/UsersModel");
const bcryptjs = require("bcryptjs");
const jsonwebtoken  = require("jsonwebtoken");
const sgMail = require('@sendgrid/mail');

const authUser = async (email, password, userType) => {
  const user = await UsersModel.findOne({ email });
  if (!user) {
    throw new Error("Email not found!");
  }
  if (user.userType !== userType) {
    throw new Error("Invalid User!");
  }
  const match = await bcryptjs.compare(password, user.password);
  if (!match) {
    throw new Error("Incorrect Password!");
  }
  return user;
};

const getAuthToken = async (user) => {
  const token = jsonwebtoken.sign({ _id: user._id }, process.env.JWT_SECRET, {expiresIn: "2 hours"});
  return token;
};
const getAdminAuthToken = async (user) => {
  const token = jsonwebtoken.sign({ _id: user._id, user: "Admin" }, process.env.JWT_SECRET, {expiresIn: "2 hours"});
  return token;
};

const getResetPasswordToken = async (user) => {
  let expiry = new Date().getTime() + 300000;
  const token = Buffer.from(JSON.stringify({expiry, _id: user._id, secret: process.env.RESET_CODE})).toString('base64')
  return token;
}

const authToken = async (req, res, next) => {
  try {
    const token = req.header("authToken").replace("ToAp ", "");
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    const user = await UsersModel.findOne({ _id: decoded._id });

    if (!user) {
        throw new Error("Authentication Failed.")
    }
    req.user = user;
    next();
  } catch (e) {
      res.status(401).send({message: "Authentication Failed."})
  }
};

const authAdminToken = async (req, res, next) => {
  try {
    const token = req.header("authToken").replace("ToAp ", "");
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    if (decoded.user !== "Admin") {
      throw new Error("Authentication Failed.")
    }
    const user = await UsersModel.findOne({ _id: decoded._id });

    if (!user) {
        throw new Error("Authentication Failed.")
    }
    req.user = user;
    next();
  } catch (e) {
      res.status(401).send({message: "Authentication Failed."})
  }
};

const sendResetEmail = async (email, token) => {
  sgMail.setApiKey(process.env.SG_TOKEN);
        const message = {
            to: email,
            from: {
                name: "Prince Kumar",
                email: "prince1815902@gmail.com"
            },
            subject: "Reset Password",
            html: `<h1>Reset Password Link:</h1><br>This link is valid for 5 Minutes only!<br><a href="http://localhost:3000/reset?auth=${token}">Reset Link</a>`
        }
        return sgMail.send(message)
}

const sendTicketToEmail = async (ticket, bus, email) => {
  sgMail.setApiKey(process.env.SG_TOKEN);
  const message = {
      to: email,
      from: {
          name: "Prince Kumar",
          email: "prince1815902@gmail.com"
      },
      subject: "Booked Ticket!",
      html: `<p>Bus No: ${bus.busNumber}</p>
      <div style="display: flex;">
      <div style="margin: 10px 40px 10px 0px;">
      <p>Bus Type: ${bus.busType}</p>
      <p>Origin: ${bus.origin}</p>
      <p>Departure Time: ${bus.departureTime}</p>
      <p>Total Fare: RS${ticket.fare}</p>
      </div>
      <div style="margin: 10px 40px;">
      <p>Journey Class: ${bus.journeyClass}</p>
      <p>Destination: ${bus.destination}</p>
      <p>Arrival Time: ${bus.arrivalTime}</p>
      </div>
      <div style="margin: 10px 40px;">
      <p>Journey Date: ${ticket.journeyDate}</p>
      <p>Distance: ${bus.distance}KM</p>
      <p>Journey Time: ${bus.journeyTime}</p>
      <p>Seats(s): ${ticket.seats}</p>
      </div>
      </div>`
  }
  return sgMail.send(message)
}

module.exports = {
  authToken,
  authUser,
  getAuthToken,
  getAdminAuthToken,
  authAdminToken,
  getResetPasswordToken,
  sendResetEmail,
  sendTicketToEmail
}