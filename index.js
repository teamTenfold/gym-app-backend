if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const serverless = require("serverless-http");
const app = express();
const bodyParser = require("body-parser");
const port = 4000;
const routeRouter = require("./src/routes/index");
require("./src/config/database");
// require("./src/utils/planCrone");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", routeRouter);
// app.listen(port, () => {
//   console.log(`Server is Runing On the port${port}`);
// });
module.exports = app;
module.exports.handler = serverless(app);
