const express = require("express");
const {
  addProduct,
  listProduct,
  removeProduct,
  singleProduct,
  updateProduct,
} = require("../controllers/product-controller");
const multer = require("../middleware/multer");
const { adminAuth } = require("../middleware/adminAuth");
const productRoute = express.Router();

productRoute.post(
  "/add",
  adminAuth,
  multer.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
    { name: "image5", maxCount: 1 },
  ]),
  addProduct
);
productRoute.get("/list", listProduct);
productRoute.get("/:id", singleProduct);
productRoute.delete("/remove", adminAuth, removeProduct);
productRoute.post("/update", adminAuth, updateProduct);

module.exports = productRoute;
