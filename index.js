if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const routeRouter = require("./src/routes/index");
app.use("/", routeRouter);

app.get("/", (req, res) => {
  res.send("✅ Server is up and running!");
});

require("./src/config/database");

const chatSocket = require("./src/sockets/chatSocket");
const io = new Server(server, {
  cors: {
    origin: "*",
  },
  transports: ["websocket", "polling"],
});

chatSocket(io);

server.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
