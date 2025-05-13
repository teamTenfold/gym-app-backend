const express = require("express");
const router = express.Router();
const user_Controller = require("../controller/user.controller");

router.post("/userSignup", user_Controller.userSignup);
router.post("/userLogin", user_Controller.userLogin);
router.patch("/verifyCode", user_Controller.verifyCode);
router.post("/resendOtp", user_Controller.resendOtp);
router.post("/forgetPassword", user_Controller.forgotPassword);
router.patch("/resetPassword/:id", user_Controller.resetPassword);

module.exports = router;
