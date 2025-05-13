const jwt = require("jsonwebtoken");

const verifyUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  const token = authHeader && authHeader.split(" ")[1];
  console.log("Token is here:", token);

  if (!token) {
    return res.status(403).json({
      message: "A token is required for authentication",
    });
  }
  try {
    const user = jwt.verify(token, process.env.TOKEN_KEY);
    req.user = user;
    console.log("User is set up:", user);
    next();
  } catch (error) {
    console.log("Error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token" });
    } else if (error.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token has expired" });
    } else {
      return res.status(500).json({ message: "Failed to authenticate token" });
    }
  }
};

module.exports = verifyUser;
