import Mongoose from "mongoose";

export const Data = Mongoose.model("data", new Mongoose.Schema({}, { strict: false }));

export default Data;
