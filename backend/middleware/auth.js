const jwt = require("jsonwebtoken");

module.exports.authUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "Not Authorized Login Again" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    if (!token_decode.id) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token: No user ID" });
    }
    req.user = { id: token_decode.id }; // Ensure req.user.id is set correctly
    console.log("Decoded token:", token_decode);
    next();
  } catch (error) {
    console.log("Token verification error:", error.message);
    return res.status(401).json({ success: false, message: error.message });
  }
};
