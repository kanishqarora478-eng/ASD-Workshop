const fs = require("fs/promises");
const path = require("path");

const pathToFile = path.join(__dirname, "../db.json");

async function readFile() {
  try {
    let data = await fs.readFile(pathToFile, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.log(err);
  }
}

async function readFileWithDelay() {
  await new Promise((resolve, reject) => {
    setTimeout(resolve, 1500);
  });

  let products = await readFile();
  return products;
}

async function writeFile(products) {
  try {
    await fs.writeFile(pathToFile, JSON.stringify(products, null, 2));
    return products;
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  readFileWithDelay,
  writeFile,
};
