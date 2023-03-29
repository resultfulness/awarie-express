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
const bcrypt_1 = __importDefault(require("bcrypt"));
const userSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    usertype: {
        type: String,
        required: true,
    },
    locations: {
        type: String,
    },
});
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        if (!this.isModified("password")) {
            return next();
        }
        try {
            const salt = yield bcrypt_1.default.genSalt(10);
            user.password = yield bcrypt_1.default.hash(user.password, salt);
            return next();
        }
        catch (e) {
            return next(e);
        }
    });
});
userSchema.methods.validatePassword = function (pass) {
    return __awaiter(this, void 0, void 0, function* () {
        return bcrypt_1.default.compare(pass, this.password);
    });
};
exports.default = mongoose_1.default.model("User", userSchema);
//# sourceMappingURL=userModel.js.map