const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createOrderFromCart = async (req, res) => {
  const userId = req.user.userId; // User ID from the decoded JWT token

  try {
    // Fetch the cart items for the user
    const cartItems = await prisma.cart.findMany({
      where: { userId },
      include: { product: true }, // Include product details
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty." });
    }

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          userId,
          nbProduct: cartItems.length,
          // Initially set totalAmount to 0, will update later
          totalAmount: 0,
        },
      });

      let totalAmount = 0; // Initialize the total amount for the order

      // Create order details for each cart item and calculate total amount
      for (const item of cartItems) {
        const itemTotal = item.quantity * item.product.price;
        totalAmount += itemTotal; // Accumulate the total amount

        await tx.orderDetail.create({
          data: {
            orderIdd: order.id, // Connect to the newly created order
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.product.price,
          },
        });
      }

      // Update the order with the calculated total amount
      await tx.cart.deleteMany({ where: { userId } });
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: { totalAmount },
      });

      return updatedOrder; // Return the updated order
    });

    // Clear the user's cart after successful order creation

    res.json({
      message: "Order created successfully from cart items.",
      order: result,
    });
  } catch (error) {
    console.error("Failed to create order from cart:", error);
    res.status(500).json({ message: "Failed to create order from cart." });
  }
};

exports.createOrderWithProduct = async (req, res) => {
  const userId = req.user.userId; // User ID from the decoded JWT token
  const { productId, quantity } = req.body; // Product ID and quantity from the request body

  try {
    // Fetch the product details to get the unit price
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const unitPrice = product.price; // Assuming the price field exists on the product model
    const totalAmount = quantity * unitPrice;

    // Create the order
    const order = await prisma.order.create({
      data: {
        userId,
        nbProduct: 1, // Since this is for a single product
        totalAmount, // Calculated based on the provided quantity and unit price
        orderDetails: {
          create: {
            productId,
            quantity,
            unitPrice,
          },
        },
      },
    });

    res.json({ message: "Order created successfully.", order });
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ message: "Failed to create order." });
  }
};

// Fetch all orders for a user
exports.getUserOrders = async (req, res) => {
  const userId = req.user.userId;

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
    });

    res.json(orders);
  } catch (error) {
    console.error("Failed to get orders:", error);
    res.status(500).json({ message: "Failed to get orders." });
  }
};

// Fetch a specific order by ID for a user
exports.getOrderById = async (req, res) => {
  const userId = req.user.userId;
  const { orderId } = req.params;

  try {
    const order = await prisma.order.findFirst({
      where: { id: parseInt(orderId), userId },
      include: {
        orderDetails: {
          include: {
            product: {
              select: { name: true }, // Only include the product name
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.json(order);
  } catch (error) {
    console.error("Failed to get order:", error);
    res.status(500).json({ message: "Failed to get order." });
  }
};
exports.cancelOrder = async (req, res) => {
  const userId = req.user.userId;
  const { orderId } = req.params;

  try {
    const order = await prisma.order.findFirst({
      where: { id: parseInt(orderId), userId },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Assuming "cancelled" is a valid status in your Order model
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: "cancelled" },
    });

    res.json({ message: "Order cancelled successfully.", order: updatedOrder });
  } catch (error) {
    console.error("Failed to cancel order:", error);
    res.status(500).json({ message: "Failed to cancel order." });
  }
};
