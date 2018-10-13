import express from "express";
import http from "http";
import Mongoose from 'mongoose';
import body_parser from 'body-parser';
import model_route from "./routes/models.mjs";

const app = express();
const server = http.createServer(app);

Mongoose.connect("mongodb://hic:hicpass@dyj1.reyah.ga:27017", { useNewUrlParser: true });

app.use(body_parser.urlencoded({ extended: false }));
app.use(body_parser.json());
app.use("/static", express.static("static"));
app.use("/models", model_route);
app.get(/^\/(?:index(?:.html?)?)?\/?$/, async (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.end("Reyah prototype.");
});

server.listen(parseInt(process.env.PORT || "3000"));
