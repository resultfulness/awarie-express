import express from "express";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

import connect_to_db from "./db/dbConnection";
import Awaria from "./models/awariaModel";
import Place from "./models/placeModel";
import User from "./models/userModel";

import auth from "./auth/user";
import adminAuth from "./auth/admin";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connect_to_db();

app.get("/", (_, res) => {
  res.status(200).send("App home page!");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ message: "Please fill in all fields" }).status(400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ message: "Invalid email" }).status(401);
  }

  // const isPasswordValid = await bcrypt.compare(password, user.password);
  const isPasswordValid = await user.validatePassword(password);
  if (!isPasswordValid) {
    return res.json({ message: "Invalid password" }).status(401);
  }

  let secret = process.env.JWT_SECRET;

  if (user.usertype === "ADMIN") {
    secret = process.env.JWT_ADMIN_SECRET;
  }

  const token = jwt.sign(
    {
      user: {
        username: user.username,
        email: user.email,
        usertype: user.usertype,
        id: user._id,
      },
    },
    secret,
    {
      expiresIn: "1h",
    }
  );

  res.json({ token, user }).status(200);
});

// GET all users
app.get("/api/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users).status(200);
  } catch (error) {
    res.json({ message: error.message }).status(500);
  }
});

// GET a user with id
app.get("/api/users/:id", adminAuth, async (req, res) => {
  try {
    const user = await User.findById(new ObjectId(req.params.id));
    if (user === null) {
      return res.json({ message: "Cannot find user" }).status(404);
    }
    res.json(user).status(200);
  } catch (error) {
    res.json({ message: error.message }).status(500);
  }
});

// POST a new user
app.post("/api/users", async (req, res) => {
  try {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      usertype: "USER",
      locations: "",
    });

    newUser.save();
    res.send(newUser).status(201);
  } catch (error) {
    res.json({ message: error.message }).status(400);
  }
});

// DELETE user with id
app.get("/api/users/:id", adminAuth, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(
      new ObjectId(req.params.id)
    );

    if (deletedUser === null) {
      return res.json({ message: "Cannot find user" }).status(404);
    }

    res.send(deletedUser).status(200);
  } catch (error) {}
});

// PUT locations for user
app.put("/api/users/:id", auth, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      new ObjectId(req.params.id),
      { $set: { locations: JSON.stringify(req.body.locations) } }
    );

    if (updatedUser === null) {
      return res.json({ message: "User not found" }).status(404);
    }

    res.send(updatedUser).status(200);
  } catch (error) {
    res.json({ message: error.message }).status(400);
  }
});

// GET all awarie
app.get("/api/awarie", auth, async (req, res) => {
  try {
    const awarie = await Awaria.find({});
    res.json(awarie).status(200);
  } catch (error) {
    res.json({ message: error.message }).status(500);
  }
});

// GET awaria by id
app.get("/api/awarie/:id", auth, async (req, res) => {
  try {
    const awaria = await Awaria.findById(new ObjectId(req.params.id));
    if (awaria === null) {
      return res.json({ message: "Awaria not found" }).status(404);
    }
    res.json(awaria).status(200);
  } catch (error) {
    res.send(error.message).status(500);
  }
});

// POST new awaria
app.post("/api/awarie", auth, async (req, res) => {
  console.log(req.body);
  const awaria = new Awaria({
    title: req.body.title,
    description: req.body.description,
    user: req.user.id,
    location: req.body.location,
  });

  try {
    const newAwaria = await awaria.save();
    res.send(newAwaria).status(201);
  } catch (error) {
    res.json({ message: error.message }).status(400);
  }
});

// PATCH awaria with id
app.patch("/api/awarie/:id", auth, async (req, res) => {
  try {
    const updatedAwaria = await Awaria.findByIdAndUpdate(
      new ObjectId(req.params.id),
      req.body,
      { new: true }
    );

    if (updatedAwaria === null) {
      return res.json({ message: "Awaria not found" }).status(404);
    }

    res.send(updatedAwaria).status(200);
  } catch (error) {
    res.json({ message: error.message }).status(400);
  }
});

// DELETE awaria with id
app.delete("/api/awarie/:id", auth, async (req, res) => {
  try {
    const deletedAwaria = await Awaria.findByIdAndDelete(
      new ObjectId(req.params.id)
    );

    if (deletedAwaria === null) {
      return res.json({ message: "Awaria not found" }).status(404);
    }

    res.send(deletedAwaria).status(200);
  } catch (error) {
    res.json({ message: error.message }).status(500);
  }
});

// GET all places
app.get("/api/places", async (req, res) => {
  try {
    const places = await Place.find({});
    res.json(places).status(200);
  } catch (error) {
    res.json({ message: error.message }).status(500);
  }
});

// GET place by id
app.get("/api/places/:id", async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (place === null) {
      return res.json({ message: "Place not found" }).status(404);
    }
    res.json(place).status(200);
  } catch (error) {
    res.send(error.message).status(500);
  }
});

// POST a new place
app.post("/api/places", adminAuth, async (req, res) => {
  try {
    const newPlace = new Place({
      _id: 9999,
      name: req.body.name,
      placeType: req.body.type,
      parent: req.body.parent,
    });

    newPlace.save();
    res
      .send({
        name: newPlace.name,
        placeType: newPlace.placeType,
        parent: newPlace.parent,
      })
      .status(201);
  } catch (error) {
    res.json({ message: error.message }).status(400);
  }
});

const port = 3000;
app.listen(port, () => console.log(`Running on port ${port}`));
