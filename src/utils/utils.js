const UsersModel = require("../Models/UsersModel");
const bcryptjs = require("bcryptjs");
const jsonwebtoken  = require("jsonwebtoken");

const authUser = async (email, password) => {
  const user = await UsersModel.findOne({ email });
  if (!user) {
    throw new Error("Email not found!");
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

module.exports = {
  authToken,
  authUser,
  getAuthToken
}