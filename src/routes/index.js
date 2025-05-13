const express = require("express");
const routeRouter = express.Router();
const auth = require("../middleware/auth");
const user = require("./userRoute");
const trainer = require("./trainerRoute");
const client = require("./clientRoute");
const plan = require("./planRoute");
const chat = require("./chatRoute");
const message = require("./messageRoute");

routeRouter.use("/user", user);
routeRouter.use("/trainer", trainer);
routeRouter.use("/client", auth, client);
routeRouter.use("/plan", plan);
routeRouter.use("/chat", auth, chat);
routeRouter.use("/message", auth, message);

module.exports = routeRouter;
