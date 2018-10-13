import Mongoose from "mongoose";

export const Data = Mongoose.model("data", new Mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    updated: { type: Date, default: Date.now },
}, { strict: false }));

export default Data;
