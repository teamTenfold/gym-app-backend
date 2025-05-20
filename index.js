// if (process.env.NODE_ENV !== "production") {
//   require("dotenv").config();
// }

// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const bodyParser = require("body-parser");

// const app = express();
// const server = http.createServer(app);
// const port = process.env.PORT || 4000;

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// const routeRouter = require("./src/routes/index");
// app.use("/", routeRouter);

// app.get("/", (req, res) => {
//   res.send("✅ Server is up and running!");
// });

// require("./src/config/database");

// const chatSocket = require("./src/sockets/chatSocket");
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//   },
// });
// chatSocket(io);

// server.listen(port, () => {
//   console.log(`🚀 Server is running on port ${port}`);
// });

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

// Enhanced Socket.IO configuration for Vercel
const io = new Server(server, {
  path: "/socket.io", // Explicit path for Vercel
  cors: {
    origin: "*",
    // methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"], // Explicit transport protocols
  allowUpgrades: true, // Required for WebSocket upgrade
  pingTimeout: 60000, // Higher timeout for serverless
  pingInterval: 25000,
});

// WebSocket upgrade handler for Vercel
app.use("/socket.io", (req, res, next) => {
  res.setHeader("Connection", "Upgrade");
  res.setHeader("Upgrade", "websocket");
  next();
});

const chatSocket = require("./src/sockets/chatSocket");
chatSocket(io);

server.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
