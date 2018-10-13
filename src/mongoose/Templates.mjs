import Mongoose from "mongoose";

export const Templates = Mongoose.model("Template", new Mongoose.Schema({
    name: String,
    path: String,
    format: String,
    fields: [{ name: String, x1: Number, y1: Number, x2: Number, y2: Number }],
}, { strict: false }));

export default Templates;
