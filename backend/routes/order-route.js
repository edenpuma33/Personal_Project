const express = require("express");
const {
  placeOrder,
  placeOrderStripe,
  allOrders,
  userOrders,
  updateStatus,
  verifyStripe,
} = require("../controllers/order-controller");
const { adminAuth } = require("../middleware/adminAuth");
const { authUser } = require("../middleware/auth");

const orderRouter = express.Router();

// Admin Features
orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, updateStatus);

// Payment Features
orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/stripe", authUser, placeOrderStripe);

// User Feature
orderRouter.post("/userorders", authUser, userOrders);

// Verify payment
orderRouter.get("/verifyStripe", authUser, verifyStripe);

module.exports = orderRouter;
