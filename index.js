const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();
const app = express();

//**USE MIDDLEWARE */
app.use(cors());
app.use(express.json());

//**CONNECT TO MONGODB */
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wk4vx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//**CONNECT TO DATABASE */

client.connect(err => {
  console.log('Database connected');
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});

//** GET API */
app.get("/", (req, res) => {
  res.send("Running the Sparrow Warehouse Server");
});

//** LISTEN API */
app.listen(port, () => {
  console.log(`Sparrow Warehouse Server is running on port ${port}`);
});