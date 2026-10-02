const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const cache = require("../middleware/cacheMiddleware");

router.get("/", cache.cacheMiddleware, productController.getProducts);

router.get("/:id", cache.cacheMiddleware, productController.getProductById);

router.post("/", productController.createProduct);

router.put("/:id", productController.updateProduct);

router.patch("/:id", productController.patchProduct);

router.delete("/:id", productController.deleteProduct);

module.exports = router;
