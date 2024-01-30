const express = require("express");
const router = express.Router();
const couponController = require("../controllers/coupon");
const { authorizeAdmin, authenticate } = require("../middleware/authenticate"); // Adjust path as needed

router.post(
  "/coupons",
  [authenticate, authorizeAdmin],
  couponController.createCoupon
);
router.get(
  "/coupons",
  [authenticate, authorizeAdmin],
  couponController.getCoupons
);
router.put(
  "/coupons/:couponId",
  [authenticate, authorizeAdmin],
  couponController.updateCoupon
);
router.delete(
  "/coupons/:couponId",
  [authenticate, authorizeAdmin],
  couponController.deleteCoupon
);

module.exports = router;
