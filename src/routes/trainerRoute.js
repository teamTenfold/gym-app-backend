const express = require("express");
const router = express.Router();
const trainer_Controller = require("../controller/trainer.controller");

router.get("/getalltrainer", trainer_Controller.getAllTrainer);

module.exports = router;
