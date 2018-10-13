import Mongoose from "mongoose";

export const Users = Mongoose.model("User", new Mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    updated: { type: Date, default: Date.now },
}, { strict: false }));

export default Users;
