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
const mongoose_1 = __importDefault(require("mongoose"));
const placeSchema = new mongoose_1.default.Schema({
    _id: {
        type: Number,
        alias: "id",
        required: true,
        createIndex: { unique: true },
    },
    name: {
        type: String,
        required: true,
    },
    placeType: {
        type: String,
        required: true,
    },
    parent: {
        type: Number,
        required: true,
    },
});
const counterSchema = new mongoose_1.default.Schema({
    _id: {
        type: String,
        required: true,
    },
    seq: {
        type: Number,
        default: 0,
    },
});
// Add a static "increment" method to the Model
// It will recieve the collection name for which to increment and return the counter value
counterSchema.static("increment", function (counterName) {
    return __awaiter(this, void 0, void 0, function* () {
        const count = yield this.findByIdAndUpdate(counterName, { $inc: { seq: 1 } }, 
        // new: return the new value
        // upsert: create document if it doesn't exist
        { new: true, upsert: true });
        return count.seq;
    });
});
const CounterModel = mongoose_1.default.model("Counter", counterSchema);
placeSchema.pre("save", function () {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isNew)
            return;
        const testVal = yield CounterModel.increment("place");
        this._id = testVal;
    });
});
exports.default = mongoose_1.default.model("Place", placeSchema);
//# sourceMappingURL=placeModel.js.map