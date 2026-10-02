const express = require("express");
const app = express();
const port = 3000;

const productRoutes = require("./routes/productRoutes");

app.use(express.json());

app.use("/products", productRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
