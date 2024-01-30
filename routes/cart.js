const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart");
const { authenticate } = require("../middleware/authenticate"); // Path to your authentication middleware

// Apply 'authenticate' middleware to protect cart routes
router.post("/cart", authenticate, cartController.updateCartQuantity);
router.post(
  "/cart/:productId",
  authenticate,
  cartController.removeCartByProductId
);
router.get("/cart", authenticate, cartController.getCart);
router.delete("/cart", authenticate, cartController.clearCart);

module.exports = router;
