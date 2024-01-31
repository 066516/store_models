const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createShippingTemplate = async (req, res) => {
  const { address, cost, duration, description } = req.body;

  try {
    const shippingTemplate = await prisma.shippingTemplate.create({
      data: {
        address,
        cost,
        duration,
        description,
      },
    });

    res.json({
      message: "Shipping template created successfully.",
      shippingTemplate,
    });
  } catch (error) {
    console.error("Failed to create shipping template:", error);
    res.status(500).json({ message: "Failed to create shipping template." });
  }
};
exports.getShippingTemplates = async (req, res) => {
  try {
    const shippingTemplates = await prisma.shippingTemplate.findMany();
    res.json(shippingTemplates);
  } catch (error) {
    console.error("Failed to get shipping templates:", error);
    res.status(500).json({ message: "Failed to get shipping templates." });
  }
};
exports.updateShippingTemplate = async (req, res) => {
  const { shippingTemplateId } = req.params;
  const { address, cost, duration, description } = req.body;

  try {
    const shippingTemplate = await prisma.shippingTemplate.update({
      where: { id: parseInt(shippingTemplateId) },
      data: {
        address,
        cost,
        duration,
        description,
      },
    });

    res.json({
      message: "Shipping template updated successfully.",
      shippingTemplate,
    });
  } catch (error) {
    console.error("Failed to update shipping template:", error);
    res.status(500).json({ message: "Failed to update shipping template." });
  }
};
exports.deleteShippingTemplate = async (req, res) => {
  const { shippingTemplateId } = req.params;

  try {
    await prisma.shippingTemplate.delete({
      where: { id: parseInt(shippingTemplateId) },
    });

    res.json({ message: "Shipping template deleted successfully." });
  } catch (error) {
    console.error("Failed to delete shipping template:", error);
    res.status(500).json({ message: "Failed to delete shipping template." });
  }
};
