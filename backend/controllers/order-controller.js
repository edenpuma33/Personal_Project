const prisma = require("../models");
const Stripe = require("stripe");

// Gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports.verifyStripe = async (req, res) => {
  const { success, orderId } = req.query;
  try {
    if (success === "true" && orderId) {
      const order = await prisma.order.findUnique({
        where: { id: Number(orderId) },
        include: { items: true }, // Ensure items are included
      });

      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }

      const updatedOrder = await prisma.order.update({
        where: { id: Number(orderId) },
        data: { payment: true, status: "Order Placed" },
      });
      res.json({
        success: true,
        message: "Payment verified",
        order: updatedOrder,
      });
    } else {
      res.json({ success: false, message: "Payment failed" });
    }
  } catch (error) {
    console.error("Stripe verification error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.allOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: { include: { product: true } } },
      orderBy: { date: "desc" },
    });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.placeOrder = async (req, res) => {
  try {
    const { items, amount, address, paymentMethod } = req.body;
    const userId = Number(req.user.id);

    const missingFields = [];
    if (!userId) missingFields.push("userId");
    if (!items || !Array.isArray(items) || items.length === 0)
      missingFields.push("items");
    if (!amount || isNaN(amount)) missingFields.push("amount");
    if (!address || typeof address !== "object") missingFields.push("address");
    if (!paymentMethod) missingFields.push("paymentMethod");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid required fields",
        missing: missingFields,
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const order = await prisma.order.create({
      data: {
        UserId: userId,
        amount: Number(amount),
        address: address,
        paymentMethod: paymentMethod,
        payment: false,
        date: new Date(),
        items: {
          create: items.map((item) => ({
            ProductId: Number(item.itemId),
            size: item.size,
            quantity: Number(item.quantity || 1),
          })),
        },
      },
    });

    await prisma.cart.deleteMany({ where: { UserId: userId } });

    res.json({ success: true, message: "Order Placed", orderId: order.id });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Placing orders using Stripe Method
module.exports.placeOrderStripe = async (req, res) => {
  try {
    const { items, amount, address } = req.body;
    const userId = Number(req.user.id);
    const { origin } = req.headers;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Items are required" });
    }
    if (!amount || isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Valid amount required" });
    }
    if (!address || typeof address !== "object") {
      return res
        .status(400)
        .json({ success: false, message: "Address required" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Use transaction to ensure atomicity
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          UserId: userId,
          amount: Number(amount),
          address: address,
          paymentMethod: "Stripe",
          payment: false,
          date: new Date(),
          status: "Pending",
          items: {
            create: items.map((item) => ({
              ProductId: Number(item.itemId),
              size: item.size,
              quantity: Number(item.quantity || 1),
            })),
          },
        },
        include: { items: true }, // Include items in the response
      });

      await tx.cart.deleteMany({ where: { UserId: userId } });

      return newOrder;
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: { name: `Order #${order.id}` },
            unit_amount: Math.round(amount * 100), // Convert GBP to pence
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/verify?success=true&orderId=${order.id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${order.id}`,
      metadata: { orderId: order.id.toString() },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    res.json({
      success: true,
      session_url: session.url,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Stripe order error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to process Stripe payment" });
  }
};

// User Orders data for frontend
module.exports.userOrders = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const orders = await prisma.order.findMany({
      where: { UserId: userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
              },
            },
          },
        },
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: "desc" },
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Order status from Admin Panel
module.exports.updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body; // Expect orderId and status in the request body

    // Validate input
    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: "Order ID and status are required",
      });
    }

    // Check if the order exists
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Update the order status
    const updatedOrder = await prisma.order.update({
      where: { id: Number(orderId) },
      data: {
        status: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
      }, // Normalize status to title case
    });

    res.json({
      success: true,
      message: "Status Updated",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
