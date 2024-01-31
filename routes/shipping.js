const express = require("express");
const router = express.Router();
const shippingController = require("../controllers/shipping");
const { authenticate } = require("../middleware/authenticate"); // Assuming you have an auth middleware

// Secure create, update, and delete operations with authentication
router.post("/shippings", authenticate, shippingController.createShipping);
router.get("/shippings", shippingController.getShippings); // Assuming no authentication required for listing
router.get("/shippings/:orderId ", shippingController.getShippingByOrderId); // Assuming no authentication required for listing
router.put(
  "/shippings/:shippingId",
  authenticate,
  shippingController.updateShipping
);
router.delete(
  "/shippings/:shippingId",
  authenticate,
  shippingController.deleteShipping
);

module.exports = router;
