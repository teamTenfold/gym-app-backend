const genOtp = () => {
  const random = "0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += random[Math.floor(Math.random() * random.length)];
  }

  return code;
};
module.exports = { genOtp };
