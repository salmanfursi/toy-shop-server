const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId, ClientSession } = require('mongodb');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.abqkukt.mongodb.net/?retryWrites=true&w=majority`;

// const uri = "mongodb+srv://ToyShop:<password>@cluster1.abqkukt.mongodb.net/?retryWrites=true&w=majority";


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();



    const toyCollection = client.db("ToyShopDB").collection("Toys");

    app.get("/toys", async (req, res) => {
      const cursor = toyCollection.find().limit(20);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/toys", async (req, res) => {
      const toys = req.body;
      const result = await toyCollection.insertOne(toys);
      res.send(result);
    });

    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });
    app.get("/toys/category/:category", async (req, res) => {
      const category = req.params.category;
      console.log(category);
      if (!category) return res.send(404);
      const results = await toyCollection
        .find({ subCategory: { $eq: category } })
        .limit(2)
        .toArray();
      res.send(results);
      
    });
    app.get("/toys/categoryall/:category", async (req, res) => {
      const category = req.params.category;
      console.log(category);
      if (!category) return res.send(404);
      const results = await toyCollection
        .find({ subCategory: { $eq: category } })
        .toArray();
      res.send(results);

    });

    app.get("/toy", async (req, res) => {
      const sortingQuery = req.query.sort;
      console.log(req.query);
     

      const result = await toyCollection
        .find({
          sellerEmail: req.query.email,
        })
        .sort({ price: sortingQuery === "desc" ? -1 : 1 })
        .toArray();
      res.send(result);
    });

    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });


    app.patch("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };

      const updateToys = req.body;
      console.log(updateToys);
      // console.log(updateToys)

      const updateDoc = {
        $set: {
          price: updateToys.price,
          availableQuantity: updateToys.availableQuantity,
          description: updateToys.description,
        },
      };
      const result = await toyCollection.updateOne(filter, updateDoc);
      res.send(result);
    });




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //  await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send("toy shop running successfully ===>")

})
app.listen(port, () => {
  console.log(`toy shop running on port ${port}`);
})