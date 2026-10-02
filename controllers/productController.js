const productService = require("../services/productService");
const cache = require("../middleware/cacheMiddleware");

async function getProducts(req, res) {
  try {
    let products = await productService.getProducts();

    cache.setCache(req.originalUrl, products);

    return res.json(products);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

async function getProductById(req, res) {
  try {
    let product = await productService.getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    cache.setCache(req.originalUrl, product);

    return res.json(product);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

async function createProduct(req, res) {
  try {
    let product = await productService.createProduct(req.body);

    cache.clearCache();

    return res.status(201).json(product);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

async function updateProduct(req, res) {
  try {
    let product = await productService.updateProduct(req.params.id, req.body);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    cache.clearCache();

    return res.json(product);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

async function patchProduct(req, res) {
  try {
    let product = await productService.updateProduct(req.params.id, req.body);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    cache.clearCache();

    return res.json(product);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

async function deleteProduct(req, res) {
  try {
    let product = await productService.deleteProduct(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    cache.clearCache();

    return res.json(product);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  patchProduct,
  deleteProduct,
};
