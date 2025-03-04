const prisma = require("../models");

module.exports.listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, users });
  } catch (error) {
    console.error("Error listing users:", error);
    res.status(500).json({ success: false, message: "Failed to list users" });
  }
};

module.exports.deleteUser = async (req, res) => {
  const { id } = req.body;

  try {
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    // Delete related carts and orders before deleting the user (cascade will handle this)
    await prisma.cart.deleteMany({ where: { UserId: Number(id) } });
    await prisma.order.deleteMany({ where: { UserId: Number(id) } });

    const deletedUser = await prisma.user.delete({
      where: { id: Number(id) },
    });

    res.json({
      success: true,
      message: "User deleted successfully",
      user: deletedUser,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};
