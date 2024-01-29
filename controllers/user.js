const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = new PrismaClient();

exports.register = async (req, res) => {
  const { fullName, email, password, phoneNumber, isAdmin } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(409).send({ message: "Email already in use." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        phoneNumber,
        isAdmin,
      },
    });

    const token = jwt.sign(
      { userId: user.id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET
    );

    res.json({ token });
  } catch (error) {
    res.status(500).send({ message: "Error creating user." });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).send({ message: "User not found." });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).send({ message: "Invalid credentials." });

    const token = jwt.sign(
      { userId: user.id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET
    );
    res.json({ token });
  } catch (error) {
    res.status(500).send({ message: "Login error." });
  }
};
exports.getUserDetails = async (req, res) => {
  const userId = req.user.userId; // Assuming `userId` is the name of the property added by your authentication middleware

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        isAdmin: true,
        orders: true,
        // Exclude sensitive information like password
      },
    });

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    res.json(user);
  } catch (error) {
    res.status(500).send({ message: "Error retrieving user details." });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        isAdmin: true,
        // Exclude sensitive information like password
      },
    });

    res.json(users);
  } catch (error) {
    res.status(500).send({ message: "Error retrieving user details." });
  }
};
exports.updateUser = async (req, res) => {
  const userId = req.user.userId; // Assuming `userId` is set by your authentication middleware
  const { fullName, email, phoneNumber } = req.body;

  try {
    // Update the user
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        fullName,
        email,
        phoneNumber,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        isAdmin: true,
        // Exclude sensitive fields like password
      },
    });

    res.json(updatedUser);
  } catch (error) {
    if (error.code === "P2025") {
      // Prisma's error code for record not found
      return res.status(404).send({ message: "User not found." });
    }
    console.error("Failed to update user: ", error);
    res.status(500).send({ message: "Failed to update user." });
  }
};
exports.deleteUser = async (req, res) => {
    const { id } = req.params; // ID of the user to be deleted
    const userId = req.user.userId; // Authenticated user's ID from JWT payload
    const isAdmin = req.user.isAdmin; // Admin status from JWT payload
  
    // Check if the authenticated user is not the user being deleted and not an admin
    if (userId !== parseInt(id) && !isAdmin) {
      return res.status(403).json({ message: "Access denied. Can only delete your own account or require admin privileges." });
    }
  
    try {
      const user = await prisma.user.delete({
        where: { id: parseInt(id) },
      });
  
      res.json({ message: "User deleted successfully." });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ message: "User not found." });
      }
      console.error("Failed to delete user:", error);
      res.status(500).json({ message: "Failed to delete user." });
    }
  };
  
// In your controller (e.g., authController.js)

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // It's often a good security practice not to reveal whether an email is registered or not
    return res.status(200).send({
      message: "If an account with that email exists, we've sent a reset link.",
    });
  }

  // Generate a reset token and expiry (1 hour from now)
  const resetToken = crypto.randomBytes(20).toString("hex");
  const resetTokenExpiry = Date.now() + 3600000; // 1 hour in milliseconds

  // Update user with reset token and expiry
  await prisma.user.update({
    where: { email },
    data: { resetToken, resetTokenExpiry },
  });

  // Send reset email (implementation depends on your email service)
  // sendResetEmail(user.email, `Your reset link: http://yourapp.com/reset?token=${resetToken}`);

  res.send({
    message: "If an account with that email exists, we've sent a reset link.",
  });
};
// In your controller (e.g., authController.js)

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gte: Date.now(),
      },
    },
  });

  if (!user) {
    return res
      .status(400)
      .send({ message: "This token is either invalid or expired." });
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update user's password and clear resetToken fields
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  res.send({ message: "Your password has been reset successfully." });
};
