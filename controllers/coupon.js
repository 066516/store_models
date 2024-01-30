const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createCoupon = async (req, res) => {
  const { code, percentage, amount, expiration, productIds } = req.body;

  // Initialize the coupon data
  let couponData = {
    code,
    expiration,
    products: {
      connect: productIds.map((id) => ({ id })),
    },
  };

  // Conditionally set percentage or amount, ensuring only one is set
  if (percentage !== undefined) {
    couponData.percentage = percentage;
    couponData.amount = null; // Nullify amount if percentage is provided
  } else if (amount !== undefined) {
    couponData.amount = amount;
    couponData.percentage = null; // Nullify percentage if amount is provided
  }

  try {
    const coupon = await prisma.coupon.create({
      data: couponData,
    });

    res.json({ message: "Coupon created successfully.", coupon });
  } catch (error) {
    console.error("Failed to create coupon:", error);
    res.status(500).json({ message: "Failed to create coupon." });
  }
};

exports.getCoupons = async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      include: { products: true }, // Include related products
    });

    res.json(coupons);
  } catch (error) {
    console.error("Failed to get coupons:", error);
    res.status(500).json({ message: "Failed to get coupons." });
  }
};
exports.updateCoupon = async (req, res) => {
  const { couponId } = req.params;
  const { code, percentage, amount, expiration, productIds } = req.body;

  // Prepare the data object for updating the coupon
  let updateData = {
    code,
    expiration,
    products: {
      connect: productIds.map((id) => ({ id })),
    },
  };

  // Set percentage or amount based on which is provided, nullify the other
  if (percentage !== undefined) {
    updateData.percentage = percentage;
    updateData.amount = null; // Nullify amount if percentage is provided
  } else if (amount !== undefined) {
    updateData.amount = amount;
    updateData.percentage = null; // Nullify percentage if amount is provided
  }

  try {
    const coupon = await prisma.coupon.update({
      where: { id: parseInt(couponId) },
      data: updateData,
    });

    res.json({ message: "Coupon updated successfully.", coupon });
  } catch (error) {
    console.error("Failed to update coupon:", error);
    res.status(500).json({ message: "Failed to update coupon." });
  }
};

exports.deleteCoupon = async (req, res) => {
  const { couponId } = req.params;

  try {
    await prisma.coupon.delete({
      where: { id: parseInt(couponId) },
    });

    res.json({ message: "Coupon deleted successfully." });
  } catch (error) {
    console.error("Failed to delete coupon:", error);
    res.status(500).json({ message: "Failed to delete coupon." });
  }
};
