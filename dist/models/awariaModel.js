"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const awariaSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
    location: {
        type: mongoose_1.default.Schema.Types.Number,
        ref: "Place",
    },
});
exports.default = mongoose_1.default.model("Awaria", awariaSchema);
//# sourceMappingURL=awariaModel.js.map