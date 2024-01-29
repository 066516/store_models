const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createProduct = async (req, res) => {
  const { name, category, price, quantity, description, status } = req.body;
  try {
    const product = await prisma.product.create({
      data: {
        name,
        category,
        price,
        quantity,
        description,
        status,
      },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).send({ message: "Failed to create product." });
  }
};
exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).send({ message: "Failed to get products." });
  }
};
exports.getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });
    if (product) {
      res.json(product);
    } else {
      res.status(404).send({ message: "Product not found." });
    }
  } catch (error) {
    res.status(500).send({ message: "Failed to get product." });
  }
};
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, category, price, quantity, description, status } = req.body;
  try {
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        category,
        price,
        quantity,
        description,
        status,
      },
    });
    res.json(product);
  } catch (error) {
    res.status(500).send({ message: "Failed to update product." });
  }
};
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.product.delete({
      where: { id: parseInt(id) },
    });
    res.send({ message: "Product deleted successfully." });
  } catch (error) {
    res.status(500).send({ message: "Failed to delete product." });
  }
};
exports.changeProductQuantity = async (req, res) => {
  const { id } = req.params; // Get product ID from URL parameters
  const { changeInQuantity } = req.body; // Get change in quantity from request body

  try {
    // Find the current product to get its current quantity
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Calculate the new quantity
    const newQuantity = product.quantity + changeInQuantity;

    // Update the product with the new quantity
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { quantity: newQuantity },
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error("Failed to change product quantity:", error);
    res.status(500).json({ message: "Failed to change product quantity." });
  }
};
