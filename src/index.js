const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);

app.get(/^\/(?:index(?:.html?)?)?\/?$/, async (req, res) => {
    res.end("Reyah prototype.");
});

server.listen(3000);
