if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const { Server } = require("socket.io");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = 4000;
const routeRouter = require("./src/routes/index");
const http = require("http");
const chatSocket = require("./src/sockets/chatSocket");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
require("./src/config/database");
// require("./src/utils/planCrone");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.send("Hello, Express");
});
app.use("/", routeRouter);
chatSocket(io);

server.listen(port, () => {
  console.log(`Server is Runing On the port${port}`);
});
