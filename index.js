const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
require("dotenv").config();
const app = express();

//**USE MIDDLEWARE */
app.use(cors());
app.use(express.json());

//**JWT TOKEN */
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: Forbidden });
    }
    console.log("decoded", decoded);
    req.decoded = decoded;
    next();
  });
};

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
    const addedCollection = client.db("bookdb").collection("addedBooks");

    //**AUTH */

    app.post("/login", (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "7d",
      });
      res.send({ accessToken });
    });

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
    app.get("/myItems", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (email === decodedEmail) {
        const query = { email };
        const cursor = addedCollection.find(query);
        const myItems = await cursor.toArray();
        res.send(myItems);
      } else{
        res.status(403).send({message: 'forbidden access'})
      }
    });
    app.post("/myItem", async (req, res) => {
      const item = req.body;
      const result = await bookCollection.insertOne(item);
      res.send(result);
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
