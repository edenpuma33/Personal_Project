const express = require("express");
const { listUsers, deleteUser } = require("../controllers/user-controller");
const { adminAuth } = require("../middleware/adminAuth");

const userRoute = express.Router();

userRoute.get("/list", adminAuth, listUsers);
userRoute.delete("/delete", adminAuth, deleteUser);

module.exports = userRoute;