const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const middlewareWrapper = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@database-2.yrgjegt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const newTasks = client.db("devcodeTask").collection("newTasks");
    const usersCollection = client
      .db("devcodeTask")
      .collection("usersCollection");
    const completedTasks = client
      .db("devcodeTask")
      .collection("completedTasks");
    const trashTasks = client.db("devcodeTask").collection("trashTasks");

    app.post("/task/add", async (req, res) => {
      const task = req.body;
      const result = await newTasks.insertOne(task);
      res.send(result);
    });

    app.post("/task/completed", async (req, res) => {
      const task = req.body;
      const result = await completedTasks.insertOne(task);
      res.send(result);
    });

    app.post("/create/user", async (req, res) => {
      const task = req.body;
      const result = await usersCollection.insertOne(task);
      res.send(result);
    });

    app.get("/task/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await newTasks.find(query).toArray();
      res.send(result);
    });

    app.get("/updatedtask/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await completedTasks.find(query).toArray();
      res.send(result);
    });

    app.get("/deletdtask/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await trashTasks.find(query).toArray();
      res.send(result);
    });

    app.put("/task/update", async (req, res) => {
      const task = req.body;
      const filter = { _id: new ObjectId(task._id) };
      const option = { upsert: true };
      const updatedDoc = {
        $set: {
          completed: true,
        },
      };
      const result = await newTasks.updateOne(filter, updatedDoc, option);
      if (result) {
        const updatedTask = await newTasks.findOne({
          _id: new ObjectId(task._id),
        });
        const result = await completedTasks.insertOne(updatedTask);

        const deleteTask = await newTasks.deleteOne({
          _id: new ObjectId(task._id),
        });
        res.send(result);
      }
    });

    app.put("/task/edit", async (req, res) => {
      const task = req.body;
      const filter = { _id: new ObjectId(task._id) };
      const option = { upsert: true };
      const updatedDoc = {
        $set: {
          name: task.name,
        },
      };
      const result = await newTasks.updateOne(filter, updatedDoc, option);
      res.send(result);
    });

    app.delete("/task/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };

      const deleted = await newTasks.findOne(filter);
      const newResult = await trashTasks.insertOne(deleted);
      const result = await newTasks.deleteOne(filter);
      res.send(result);
    });
  } catch (error) {
    console.log("Connection to MongoDB failed");
  }
}

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("devcode Server Running");
});

app.listen(port, () => {
  console.log(`devcode Server Running in port ${port}`);
});
