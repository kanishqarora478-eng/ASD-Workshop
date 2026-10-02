const database = require("../database/productDatabase");

async function getProducts() {
  let products = await database.readFileWithDelay();
  return products;
}

async function getProductById(id) {
  let products = await database.readFileWithDelay();

  let product = products.find((product) => product.id == id);

  return product;
}

async function createProduct(product) {
  let products = await database.readFileWithDelay();

  products.push(product);

  await database.writeFile(products);

  return product;
}

async function updateProduct(id, data) {
  let products = await database.readFileWithDelay();

  let product = products.find((product) => product.id == id);

  if (!product) {
    return null;
  }

  Object.assign(product, data);

  await database.writeFile(products);

  return product;
}

async function deleteProduct(id) {
  let products = await database.readFileWithDelay();

  let productIndex = products.findIndex((product) => product.id == id);

  if (productIndex === -1) {
    return null;
  }

  let product = products.splice(productIndex, 1);

  await database.writeFile(products);

  return product[0];
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
