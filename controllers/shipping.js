const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createShipping = async (req, res) => {
  const { status, orderId, templateId } = req.body;

  try {
    const shipping = await prisma.shipping.create({
      data: {
        status,
        orderId,
        templateId,
      },
    });

    res.json({ message: "Shipping record created successfully.", shipping });
  } catch (error) {
    console.error("Failed to create shipping record:", error);
    res.status(500).json({ message: "Failed to create shipping record." });
  }
};
exports.getShippings = async (req, res) => {
  try {
    const shippings = await prisma.shipping.findMany({
      include: {
        order: true, // Include related order
        template: true, // Include related shipping template
      },
    });

    res.json(shippings);
  } catch (error) {
    console.error("Failed to get shipping records:", error);
    res.status(500).json({ message: "Failed to get shipping records." });
  }
};
exports.getShippingByOrderId = async (req, res) => {
  const { orderId } = req.params; // Extract orderId from request parameters

  try {
    const shipping = await prisma.shipping.findUnique({
      where: { orderId: parseInt(orderId) },
      include: {
        order: true, // Include related order details
        template: true, // Include related shipping template details
      },
    });

    if (!shipping) {
      return res.status(404).json({
        message: "Shipping record not found for the specified order.",
      });
    }

    res.json(shipping);
  } catch (error) {
    console.error("Failed to get shipping record:", error);
    res.status(500).json({
      message: "Failed to get shipping record for the specified order.",
    });
  }
};

exports.updateShipping = async (req, res) => {
  const { shippingId } = req.params;
  const { status, orderId, templateId } = req.body;

  try {
    const shipping = await prisma.shipping.update({
      where: { id: parseInt(shippingId) },
      data: {
        status,
        orderId,
        templateId,
      },
    });

    res.json({ message: "Shipping record updated successfully.", shipping });
  } catch (error) {
    console.error("Failed to update shipping record:", error);
    res.status(500).json({ message: "Failed to update shipping record." });
  }
};
exports.deleteShipping = async (req, res) => {
  const { shippingId } = req.params;

  try {
    await prisma.shipping.delete({
      where: { id: parseInt(shippingId) },
    });

    res.json({ message: "Shipping record deleted successfully." });
  } catch (error) {
    console.error("Failed to delete shipping record:", error);
    res.status(500).json({ message: "Failed to delete shipping record." });
  }
};
