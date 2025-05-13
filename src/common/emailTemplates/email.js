const userModel = require("../../model/userModel");
const path = require("path");
const fs = require("fs");
const hbs = require("handlebars");
const sendEmail = require("../../utils/SendEmail");

const Send_Regiser_Email = async (userid, otpcode) => {
  try {
    let filename = "register.html";
    const user = await userModel.findOne(
      { _id: userid },
      { firstName: 1, lastName: 1, email: 1 }
    );

    if (user) {
      let htmlPath = path.join(__dirname, filename);
      let readfile = await fs.promises.readFile(htmlPath, "utf8");
      const template = hbs.compile(readfile);
      const html = template({
        firstName: user.firstName,
        lastName: user.lastName,
        code: otpcode,
      });
      const mailOptions = {
        from: "abdul.basit@logicloopsolutions.net",
        to: user.email,
        subject: "Email Verification",
        html: html,
      };

      await sendEmail(mailOptions);
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};
const Send_ForgotPassword_Email = async (userid, otpcode) => {
  try {
    let filename = "resetPass.html";
    const user = await userModel.findOne(
      { _id: userid },
      { firstName: 1, lastName: 1, email: 1 }
    );

    if (user) {
      let htmlPath = path.join(__dirname, filename);
      let readfile = await fs.promises.readFile(htmlPath, "utf8");
      const template = hbs.compile(readfile);
      const html = template({
        firstName: user.firstName,
        lastName: user.lastName,
        code: otpcode,
      });
      const mailOptions = {
        from: "abdul.basit@logicloopsolutions.net",
        to: user.email,
        subject: "Password Reset Verification",
        html: html,
      };

      await sendEmail(mailOptions);
    }
  } catch (error) {
    console.log("error in sending Email ", error);
  }
};

module.exports = { Send_Regiser_Email, Send_ForgotPassword_Email };
