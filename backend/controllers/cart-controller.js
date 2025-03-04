const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

// Add products to user cart
module.exports.addToCart = async (req, res) => {
  try {
    const { itemId, size } = req.body;
    const userId = Number(req.user.id); // Use req.user.id from authUser

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const existingCartItem = await prisma.cart.findFirst({
      where: {
        UserId: userId,
        ProductId: Number(itemId),
        sizes: { equals: JSON.stringify([size]) },
      },
    });

    if (existingCartItem) {
      await prisma.cart.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + 1 },
      });
    } else {
      await prisma.cart.create({
        data: {
          UserId: userId,
          ProductId: Number(itemId),
          sizes: JSON.stringify([size]),
          quantity: 1,
        },
      });
    }

    res.json({ success: true, message: 'Added To Cart' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.json({ success: false, message: error.message });
  }
};

// Update user cart
module.exports.updateCart = async (req, res) => {
  try {
    const { itemId, size, quantity } = req.body;
    const userId = Number(req.user.id);

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const cartItem = await prisma.cart.findFirst({
      where: {
        UserId: userId,
        ProductId: Number(itemId),
        sizes: { equals: JSON.stringify([size]) },
      },
    });

    if (cartItem) {
      if (quantity <= 0) {
        await prisma.cart.delete({
          where: { id: cartItem.id },
        });
        res.json({ success: true, message: 'Cart Item Removed' });
      } else {
        await prisma.cart.update({
          where: { id: cartItem.id },
          data: { quantity: Number(quantity) },
        });
        res.json({ success: true, message: 'Cart Updated' });
      }
    } else {
      res.status(404).json({ success: false, message: 'Cart item not found' });
    }
  } catch (error) {
    console.error('Error updating cart:', error);
    res.json({ success: false, message: error.message });
  }
};

// Get user cart data
module.exports.getUserCart = async (req, res) => {
  try {
    const userId = Number(req.user.id);

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const cartItems = await prisma.cart.findMany({
      where: { UserId: userId },
      select: {
        ProductId: true,
        sizes: true,
        quantity: true,
      },
    });

    const cartData = {};
    cartItems.forEach(item => {
      const size = JSON.parse(item.sizes)[0];
      if (!cartData[item.ProductId]) {
        cartData[item.ProductId] = {};
      }
      cartData[item.ProductId][size] = item.quantity;
    });

    res.json({ success: true, cartData });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.json({ success: false, message: error.message });
  }
};

// Reset user cart
module.exports.resetCart = async (req, res) => {
  try {
    const userId = Number(req.user.id);

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await prisma.cart.deleteMany({
      where: { UserId: userId },
    });

    res.json({ success: true, message: 'Cart Reset Successfully' });
  } catch (error) {
    console.error('Error resetting cart:', error);
    res.json({ success: false, message: error.message });
  }
};