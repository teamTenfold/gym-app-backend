const express = require("express");
const router = express.Router();
const plan_Controller = require("../controller/plan.controller");
const auth = require("../middleware/auth");
router.post("/addPlan", plan_Controller.addPlan);
router.get("/getPlan", auth, plan_Controller.getPlan);

module.exports = router;
