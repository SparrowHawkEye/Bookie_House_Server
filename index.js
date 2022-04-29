const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();
const app = express();

//**USE MIDDLEWARE */
app.use(cors());
app.use(express.json());

//** GET API */
app.get("/", (req, res) => {
  res.send("Running the Sparrow Warehouse Server");
});

//** LISTEN API */
app.listen(port, () => {
  console.log(`Sparrow Warehouse Server is running on port ${port}`);
});
