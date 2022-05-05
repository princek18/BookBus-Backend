const express = require("express");
require("./db/mongoose.js");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRouter = require("./Routes/UsersRoute");
const busRouter = require("./Routes/BusesRoute.js");

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

app.use(userRouter);
app.use(busRouter);


app.listen(process.env.PORT, () => {
    console.log(`Server up on port ${process.env.PORT}`);
  });
