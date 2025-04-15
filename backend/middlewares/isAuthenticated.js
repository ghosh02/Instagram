const jwt = require("jsonwebtoken");
module.exports.isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "You are not authenticated" });
    }
    const decode = await jwt.verify(token, process.env.JWT_SECRET);
    req.id = decode.userId;
    next();
  } catch (error) {
    console.log(error);
  }
};
