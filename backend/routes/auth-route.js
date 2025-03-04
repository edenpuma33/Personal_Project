const express = require("express");
const {
  loginUser,
  registerUser,
  adminLogin,
} = require("../controllers/auth-controller");
const authRoute = express.Router();

authRoute.post("/register", registerUser);
authRoute.post("/login", loginUser);
authRoute.post("/admin", adminLogin);

module.exports = authRoute;
