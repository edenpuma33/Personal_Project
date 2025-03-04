const cloudinary = require("../config/cloudinary");
const prisma = require("../models");

// function for add product
module.exports.addProduct = async (req, res) => {
  const { name, description, price, category, subCategory, sizes, bestseller } =
    req.body;

  const image1 = req.files.image1 && req.files.image1[0];
  const image2 = req.files.image2 && req.files.image2[0];
  const image3 = req.files.image3 && req.files.image3[0];
  const image4 = req.files.image4 && req.files.image4[0];
  const image5 = req.files.image5 && req.files.image5[0];
  const image6 = req.files.image6 && req.files.image6[0];
  const images = [image1, image2, image3, image4, image5, image6].filter(
    (item) => item !== undefined
  );

  const imagesUrl = await Promise.all(
    images.map(async (item) => {
      const result = await cloudinary.uploader.upload(item.path, {
        resource_type: "image",
      });
      return result.secure_url;
    })
  );

  const productData = {
    name,
    description,
    price: Number(price),
    category,
    subCategory,
    sizes: JSON.parse(sizes),
    bestSeller: bestseller === "true" ? true : false,
    image: imagesUrl,
  };

  try {
    const result = await prisma.product.create({ data: productData });
    res.status(201).json({ success: true, message: "Product Added", result });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add product",
      error: error.message,
    });
  }
};

// function for list product
module.exports.listProduct = async (req, res) => {
  console.log("Request from:", req.headers.origin);
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      image: true,
      category: true,
      subCategory: true,
      sizes: true,
      bestSeller: true,
    },
  });
  res.json({ success: true, products });
};

// function for remove product
module.exports.removeProduct = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Product ID is required" });
  }
  const products = await prisma.product.delete({ where: { id: Number(id) } });
  res.json({ success: true, message: "Product Removed", products });
};

// function for single product info
module.exports.singleProduct = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Product ID is required" });
  }
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      image: true,
      category: true,
      subCategory: true,
      sizes: true,
      bestSeller: true,
    },
  });

  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }
  res.json({ success: true, product });
};

// product-controller.js
module.exports.updateProduct = async (req, res) => {
  const {
    id,
    name,
    description,
    price,
    category,
    subCategory,
    sizes,
    bestseller,
  } = req.body;

  try {
    // Validate input
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });
    }

    const productData = {
      name,
      description,
      price: Number(price),
      category,
      subCategory,
      sizes: JSON.parse(sizes),
      bestSeller: Boolean(bestseller),
    };

    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: productData,
    });

    res.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update product" });
  }
};
