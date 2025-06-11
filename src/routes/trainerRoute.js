const express = require("express");
const router = express.Router();
const trainer_Controller = require("../controller/trainer.controller");
const auth = require("../middleware/auth");
router.get("/getalltrainer", auth, trainer_Controller.getAllTrainer);
router.get("/getcurrentuser", auth, trainer_Controller.getCurrentUser);
router.post("/editProfile", auth, trainer_Controller.editProfile);

module.exports = router;
