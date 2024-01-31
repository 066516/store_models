const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order");
const { authenticate } = require("../middleware/authenticate");
router.post("/order", authenticate, orderController.createOrderFromCart);
router.post("/order/one", authenticate, orderController.createOrderWithProduct);
router.get("/orders", authenticate, orderController.getUserOrders);
router.get(
  "/orders-pending",
  authenticate,
  orderController.getUserOrdersOnPending
);
router.get("/orders/:orderId", authenticate, orderController.getOrderById);
router.put("/orders/:orderId", authenticate, orderController.cancelOrder);
module.exports = router;
