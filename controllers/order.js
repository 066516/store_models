const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function applyCouponDiscount(totalAmount, coupon, cartItems) {
  if (coupon.percentage) {
    return totalAmount * (1 - coupon.percentage / 100);
  } else if (coupon.amount) {
    // Ensure discount does not exceed total amount
    return Math.max(totalAmount - coupon.amount, 0);
  }
  return totalAmount;
}

exports.createOrderFromCart = async (req, res) => {
  const userId = req.user.userId; // User ID from the decoded JWT token
  const { couponCode } = req.body; // Coupon code from the request body

  try {
    const cartItems = await prisma.cart.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty." });
    }

    // Fetch and validate the coupon if provided
    let coupon = null;
    if (couponCode) {
      coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
        include: { products: true },
      });
      if (!coupon || new Date(coupon.expiration) < new Date()) {
        return res.status(400).json({ message: "Invalid or expired coupon." });
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;

      const order = await tx.order.create({
        data: { userId, nbProduct: cartItems.length, totalAmount: 0 },
      });

      for (const item of cartItems) {
        const itemTotal = item.quantity * item.product.price;
        totalAmount += itemTotal;

        await tx.orderDetail.create({
          data: {
            orderIdd: order.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.product.price,
          },
        });

        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      // Apply coupon if valid and applicable to the products in the cart
      if (coupon) {
        totalAmount = applyCouponDiscount(totalAmount, coupon, cartItems);
      }

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: { totalAmount },
      });

      await tx.cart.deleteMany({ where: { userId } });

      return updatedOrder;
    });

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
  const userId = req.user.userId;
  const { productId, quantity, couponCode } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });

      if (!product) {
        throw new Error("Product not found.");
      }

      if (product.quantity < quantity) {
        throw new Error("Quantity insufficient.");
      }

      let coupon = null;
      if (couponCode) {
        coupon = await tx.coupon.findUnique({
          where: { code: couponCode },
          include: { products: true },
        });
        if (!coupon || !coupon.products.some(p => p.id === productId) || new Date(coupon.expiration) < new Date()) {
          throw new Error("Invalid or expired coupon, or not applicable to this product.");
        }
      }

      const unitPrice = product.price;
      let totalAmount = quantity * unitPrice;

      const order = await tx.order.create({
        data: {
          userId,
          nbProduct: 1,
          totalAmount, // This will be updated later
          orderDetails: { create: { productId, quantity, unitPrice } },
        },
      });

      await tx.product.update({ where: { id: productId }, data: { quantity: { decrement: quantity } } });

      // Apply coupon if valid
      if (coupon) {
        totalAmount = applyCouponDiscount(totalAmount, coupon, [{ product, quantity }]);
      }

      const updatedOrder = await tx.order.update({ where: { id: order.id }, data: { totalAmount } });

      return updatedOrder;
    });

    res.json({ message: "Order created successfully.", order: result });
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ message: error.message });
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
  const userId = req.user.userId; // User ID from the decoded JWT token
  const { orderId } = req.params; // Order ID from the request parameters

  try {
    // Start a transaction
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: parseInt(orderId), userId },
        include: { orderDetails: true },
      });

      if (!order) {
        return res.status(404).json({ message: "Order not found." });
      }

      // Assuming "cancelled" is a valid status in your Order model
      await tx.order.update({
        where: { id: order.id },
        data: { status: "cancelled" },
      });

      // Increment the product quantity for each order detail
      const updateProductQuantities = order.orderDetails.map((detail) => {
        return tx.product.update({
          where: { id: detail.productId },
          data: { quantity: { increment: detail.quantity } }, // Increment the product quantity based on the order detail
        });
      });

      // Wait for all product quantity updates to complete
      await Promise.all(updateProductQuantities);
    });

    res.json({
      message: "Order cancelled successfully and product quantities updated.",
    });
  } catch (error) {
    console.error(
      "Failed to cancel order and update product quantities:",
      error
    );
    res.status(500).json({
      message: "Failed to cancel order and update product quantities.",
    });
  }
};
