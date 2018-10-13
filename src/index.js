const express = require("express");
const http = require("http");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const server = http.createServer(app);

mongoose.connect("mongodb://hic:hicpass@dyj1.reyah.ga:27017", { useNewUrlParser: true });
const Users = mongoose.model('User', require('./mongoose/Users.js'));
const Templates = mongoose.model('Template', require('./mongoose/Template.js'));

module.exports = {Users, Templates};

app.use(bodyParser.urlencoded({ extended: false }));
app.use('/models', require('./routes/models'));
app.get(/^\/(?:index(?:.html?)?)?\/?$/, async (req, res) => {
    res.end("Reyah prototype.");
});
server.listen(parseInt(process.env.PORT || "3000"));