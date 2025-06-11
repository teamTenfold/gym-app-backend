const express = require("express");
const router = express.Router();
const rating_controller = require("../controller/rating.controller");

router.post("/addRating", rating_controller.addRating);

module.exports = router;
