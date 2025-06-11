const express = require("express");
const router = express.Router();
const client_Controller = require("../controller/client.controller");
const auth = require("../middleware/auth");
router.post("/sendRequest", client_Controller.sendRequest);
router.post("/acceptRequest", client_Controller.acceptRequest);
router.post("/deleteRequest", client_Controller.deleteRequest);
router.get("/getallClients", client_Controller.getClients);
router.get("/getallRequests", client_Controller.getallRequests);
router.get("/homeClients", client_Controller.HomeClient);

module.exports = router;
