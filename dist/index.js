"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongodb_1 = require("mongodb");
const dbConnection_1 = __importDefault(require("./db/dbConnection"));
const awariaModel_1 = __importDefault(require("./models/awariaModel"));
const placeModel_1 = __importDefault(require("./models/placeModel"));
const userModel_1 = __importDefault(require("./models/userModel"));
const user_1 = __importDefault(require("./auth/user"));
const admin_1 = __importDefault(require("./auth/admin"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
(0, dbConnection_1.default)();
app.get("/", (_, res) => {
    res.status(200).send("App home page!");
});
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.json({ message: "Please fill in all fields" }).status(400);
    }
    const user = yield userModel_1.default.findOne({ email });
    if (!user) {
        return res.json({ message: "Invalid email" }).status(401);
    }
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    const isPasswordValid = yield user.validatePassword(password);
    if (!isPasswordValid) {
        return res.json({ message: "Invalid password" }).status(401);
    }
    let secret = process.env.JWT_SECRET;
    if (user.usertype === "ADMIN") {
        secret = process.env.JWT_ADMIN_SECRET;
    }
    const token = jsonwebtoken_1.default.sign({
        user: {
            username: user.username,
            email: user.email,
            usertype: user.usertype,
            id: user._id,
        },
    }, secret, {
        expiresIn: "1h",
    });
    res.json({ token, user }).status(200);
}));
// GET all users
app.get("/api/users", admin_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield userModel_1.default.find({});
        res.json(users).status(200);
    }
    catch (error) {
        res.json({ message: error.message }).status(500);
    }
}));
// GET a user with id
app.get("/api/users/:id", admin_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findById(new mongodb_1.ObjectId(req.params.id));
        if (user === null) {
            return res.json({ message: "Cannot find user" }).status(404);
        }
        res.json(user).status(200);
    }
    catch (error) {
        res.json({ message: error.message }).status(500);
    }
}));
// POST a new user
app.post("/api/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newUser = new userModel_1.default({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            usertype: "USER",
            locations: "",
        });
        newUser.save();
        res.send(newUser).status(201);
    }
    catch (error) {
        res.json({ message: error.message }).status(400);
    }
}));
// DELETE user with id
app.get("/api/users/:id", admin_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedUser = yield userModel_1.default.findByIdAndDelete(new mongodb_1.ObjectId(req.params.id));
        if (deletedUser === null) {
            return res.json({ message: "Cannot find user" }).status(404);
        }
        res.send(deletedUser).status(200);
    }
    catch (error) { }
}));
// PUT locations for user
app.put("/api/users/:id", user_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedUser = yield userModel_1.default.findByIdAndUpdate(new mongodb_1.ObjectId(req.params.id), { $set: { locations: JSON.stringify(req.body.locations) } });
        if (updatedUser === null) {
            return res.json({ message: "User not found" }).status(404);
        }
        res.send(updatedUser).status(200);
    }
    catch (error) {
        res.json({ message: error.message }).status(400);
    }
}));
// GET all awarie
app.get("/api/awarie", user_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const awarie = yield awariaModel_1.default.find({});
        res.json(awarie).status(200);
    }
    catch (error) {
        res.json({ message: error.message }).status(500);
    }
}));
// GET awaria by id
app.get("/api/awarie/:id", user_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const awaria = yield awariaModel_1.default.findById(new mongodb_1.ObjectId(req.params.id));
        if (awaria === null) {
            return res.json({ message: "Awaria not found" }).status(404);
        }
        res.json(awaria).status(200);
    }
    catch (error) {
        res.send(error.message).status(500);
    }
}));
// POST new awaria
app.post("/api/awarie", user_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const awaria = new awariaModel_1.default({
        title: req.body.title,
        description: req.body.description,
        user: req.user.id,
        location: req.body.location,
    });
    try {
        const newAwaria = yield awaria.save();
        res.send(newAwaria).status(201);
    }
    catch (error) {
        res.json({ message: error.message }).status(400);
    }
}));
// PATCH awaria with id
app.patch("/api/awarie/:id", user_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedAwaria = yield awariaModel_1.default.findByIdAndUpdate(new mongodb_1.ObjectId(req.params.id), req.body, { new: true });
        if (updatedAwaria === null) {
            return res.json({ message: "Awaria not found" }).status(404);
        }
        res.send(updatedAwaria).status(200);
    }
    catch (error) {
        res.json({ message: error.message }).status(400);
    }
}));
// DELETE awaria with id
app.delete("/api/awarie/:id", user_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedAwaria = yield awariaModel_1.default.findByIdAndDelete(new mongodb_1.ObjectId(req.params.id));
        if (deletedAwaria === null) {
            return res.json({ message: "Awaria not found" }).status(404);
        }
        res.send(deletedAwaria).status(200);
    }
    catch (error) {
        res.json({ message: error.message }).status(500);
    }
}));
// GET all places
app.get("/api/places", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const places = yield placeModel_1.default.find({});
        res.json(places).status(200);
    }
    catch (error) {
        res.json({ message: error.message }).status(500);
    }
}));
// GET place by id
app.get("/api/places/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const place = yield placeModel_1.default.findById(req.params.id);
        if (place === null) {
            return res.json({ message: "Place not found" }).status(404);
        }
        res.json(place).status(200);
    }
    catch (error) {
        res.send(error.message).status(500);
    }
}));
// POST a new place
app.post("/api/places", admin_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newPlace = new placeModel_1.default({
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
    }
    catch (error) {
        res.json({ message: error.message }).status(400);
    }
}));
const port = 3000;
app.listen(port, () => console.log(`Running on port ${port}`));
//# sourceMappingURL=index.js.map