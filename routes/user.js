const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const {authenticate} = require("../middleware/authenticate"); // Make sure this path is correct

router.post("/auth/register", userController.register);
router.post("/auth/login", userController.login);
router.get("/user", authenticate, userController.getUserDetails);
router.get("/users", userController.getAllUsers);
router.put("/users", authenticate, userController.updateUser);
router.delete("/users/:id", authenticate, userController.deleteUser);

module.exports = router;
