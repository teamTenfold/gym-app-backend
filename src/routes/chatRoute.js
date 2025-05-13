const express = require("express");
const router = express.Router();
const caht_Controller = require("../controller/chat.controller");

router.post("/createChat", caht_Controller.createChat);
router.get("/getChat", caht_Controller.getChat);

module.exports = router;
