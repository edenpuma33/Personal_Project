const jwt = require("jsonwebtoken");

module.exports.adminAuth = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "Not Authorized. Login Again" });
  }
  const token = authorization.split(" ")[1];
  const token_decode = jwt.verify(token, process.env.JWT_SECRET);

  if (token_decode.email !== process.env.ADMIN_EMAIL) {
    return res
      .status(403)
      .json({ success: false, message: "Forbidden. Admin Access Only" });
  }
  req.admin = token_decode;
  next();
};
