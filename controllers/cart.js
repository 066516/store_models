const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create or update the quantity of the product in the user's cart
exports.updateCartQuantity = async (req, res) => {
  const userId = req.user.userId; // User ID from the decoded JWT token
  const { productId, quantity } = req.body; // Product ID and new quantity from the request body

  try {
    // Check if the cart exists for the user and product
    const existingCart = await prisma.cart.findFirst({
      where: { userId, productId },
    });

    let cart;
    if (existingCart) {
      // If the cart exists, update the quantity
      cart = await prisma.cart.update({
        where: { id: existingCart.id },
        data: { quantity },
      });
    } else {
      // If the cart does not exist, create a new cart with the product and quantity
      cart = await prisma.cart.create({
        data: { userId, productId, quantity },
      });
    }

    res.json(cart);
  } catch (error) {
    console.error("Failed to update cart quantity:", error);
    res.status(500).json({ message: "Failed to update cart quantity." });
  }
};

// Get the user's cart
exports.getCart = async (req, res) => {
  const userId = req.user.userId; // User ID from the decoded JWT token

  try {
    const cart = await prisma.cart.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            name: true, // Select only the name
            price: true, // and the price of the product
          },
        },
      }, // Include the product details
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    res.json(cart);
  } catch (error) {
    console.error("Failed to get cart:", error);
    res.status(500).json({ message: "Failed to get cart." });
  }
};
exports.removeCartByProductId = async (req, res) => {
  const userId = req.user.userId; // User ID from the decoded JWT token
  const { productId } = req.params; // Product ID from the URL parameter

  try {
    // Find the cart associated with the user and product ID
    const cart = await prisma.cart.findFirst({
      where: {
        userId,
        productId: parseInt(productId),
      },
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    // Delete the found cart
    await prisma.cart.delete({
      where: {
        id: cart.id,
      },
    });

    res.json({ message: "Cart removed successfully." });
  } catch (error) {
    console.error("Failed to remove cart:", error);
    res.status(500).json({ message: "Failed to remove cart." });
  }
};

// Clear the user's cart
exports.clearCart = async (req, res) => {
  const userId = req.user.userId; // User ID from the decoded JWT token

  try {
    await prisma.cart.deleteMany({
      where: { userId },
    });

    res.json({ message: "Cart cleared successfully." });
  } catch (error) {
    console.error("Failed to clear cart:", error);
    res.status(500).json({ message: "Failed to clear cart." });
  }
};
