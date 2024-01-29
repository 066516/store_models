const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');
const { authenticate, authorizeAdmin } = require('../middleware/authenticate'); // Adjust path as needed

// Protected routes (only accessible by authenticated admins)
router.post('/products', [authenticate, authorizeAdmin], productController.createProduct);
router.post('/products/:id', [authenticate, authorizeAdmin], productController.changeProductQuantity);
router.put('/products/:id', [authenticate, authorizeAdmin], productController.updateProduct);
router.delete('/products/:id', [authenticate, authorizeAdmin], productController.deleteProduct);

// Public routes (accessible by anyone)
router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProductById);

module.exports = router;
