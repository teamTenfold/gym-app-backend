const express = require("express");
const router = express.Router();
const message_Controller = require("../controller/message.controller");

router.post("/createMessage", message_Controller.createMessage);
router.get("/getMessage", message_Controller.getMessage);

module.exports = router;
