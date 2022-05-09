const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
require("dotenv").config();
const app = express();

//**USE MIDDLEWARE */
app.use(cors());
app.use(express.json());

//**CONNECT TO MONGODB */
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wk4vx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

//**CONNECT TO DATABASE */

async function run() {
  try {
    await client.connect();
    const bookCollection = client.db("bookdb").collection("books");

    //** GET API (http://localhost:5000/books) FROM DATABASE*/

    app.get("/books", async (req, res) => {
      const query = {};
      const cursor = bookCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/book/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const book = await bookCollection.findOne(query);
      res.send(book);
    });
    //** POST API (http://localhost:5000/book) FROM DATABASE*/

    app.post("/book", async (req, res) => {
      const book = req.body;
      const result = await bookCollection.insertOne(book);
      res.send(result);
    });

    //** UPDATE API (http://localhost:5000/book/${id}) FROM DATABASE*/
    app.put("/book/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: { ...data },
      };
      const result = await bookCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });
    //** DELETE API (http://localhost:5000/book/${id}) FROM DATABASE*/
    app.delete("/book/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await bookCollection.deleteOne(filter);
      res.send(result);
    });

    //** MY ITEMS API */
    app.get("/myItems", async (req, res) => {
      const email = req.query.email;

      const query = { email };
      const cursor = bookCollection.find(query);
      const myItems = await cursor.toArray();
      res.send(myItems);

      app.post("/myItem", async (req, res) => {
        const item = req.body;
        const result = await bookCollection.insertOne(item);
        res.send(result);
      });
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

//** GET API */

app.get("/", (req, res) => {
  res.send("Running the Sparrow Warehouse Server");
});

//** LISTEN API */
app.listen(port, () => {
  console.log(`Sparrow Warehouse Server is running on port ${port}`);
});
