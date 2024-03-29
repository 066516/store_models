const express = require("express");
const app = express();
require("dotenv").config();
app.use(express.json());
const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");
const couponRoutes = require("./routes/coupon");
const shippingtemRoutes = require("./routes/shippingTemplate");
const shippingRoutes = require("./routes/shipping");
// Assuming you have these route files set up in your project
app.use("/api", userRoutes);
app.use("/api", productRoutes);
app.use("/api", cartRoutes);
app.use("/api", orderRoutes);
app.use("/api", couponRoutes);
app.use("/api", shippingtemRoutes);
app.use("/api", shippingRoutes);
const PORT = process.env.PORT || 3000; // Default to 3000 if PORT isn't set
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
