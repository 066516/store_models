const express = require("express");
const router = express.Router();
const shippingController = require("../controllers/shippingTemplate");
const { authenticate } = require("../middleware/authenticate"); // Assuming you have an auth middleware

// Apply authentication middleware to create, update, and delete operations
router.post(
  "/shipping-templates",
  authenticate,
  shippingController.createShippingTemplate
);
router.get("/shipping-templates", shippingController.getShippingTemplates); // Assuming no authentication required for listing
router.put(
  "/shipping-templates/:shippingTemplateId",
  authenticate,
  shippingController.updateShippingTemplate
);
router.delete(
  "/shipping-templates/:shippingTemplateId",
  authenticate,
  shippingController.deleteShippingTemplate
);

module.exports = router;
