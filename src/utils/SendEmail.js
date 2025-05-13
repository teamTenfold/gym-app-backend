const nodemailer = require("nodemailer");
const sendEmail = async (mailoptions) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.logicloopsolutions.net",
    auth: {
      user: "abdul.basit@logicloopsolutions.net",
      pass: "hKFAQ2QarjBBpLfNJBD5",
    },
    port: 465,
    secure: true,
  });
  await transporter.sendMail(mailoptions, (error, Info) => {
    if (error) {
      console.log("Error sending Email ", error);
    } else {
      console.log("Success Sending email ", Info.accepted);
    }
  });
};
module.exports = sendEmail;
