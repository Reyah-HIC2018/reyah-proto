const express = require("express");
const http = require("http");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const server = http.createServer(app);

mongoose.connect("mongodb://hic:hicpass@dyj1.reyah.ga:27017", { useNewUrlParser: true });
console.log(mongoose.connection.readyState);

const Users = mongoose.model('User', require('./mongoose/Users.js'));
const Template = mongoose.model('Template', require('./mongoose/Template.js'));

Users.findOne({ username: "needlex" }, (err, usr) => {
    if (err) { return console.error(err); }
    usr.testfield = "repgergerpgorpokr";
    console.log(usr);
    usr.save();
    console.log(usr);
});

// Template.create({name: "test", template: "iejfiozefjozefji", format: "jpg", fields: [ { name: "testfield", x1: 10, y1: 10, x2: 40, y2: 40 } ],})

const router = express.Router();

router.post('/model/:name', async (req, res) => {
    if (!req.body.template || !req.body.metadata) { return res.status(400).json({ message: "Missing data" }); }
    try {
        await Template.create({
            name: req.params.name,
            template: req.body.template,
            fields: req.body.metadata
        });
        res.status(200).json({ message: "OK" });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

router.get('/models/:name', async (req, res) => {
    try {
        const found = await Template.findOne({ name: req.params.name }).exec();
        const result = {
            name: found.name,
            template: found.template,
            format: found.format,
            fields: found.fields
        }
        const user = await Users.findOne({ username: 'needlex' }).exec();
        result.fields.forEach(elem => {
            result.fields.value = user[elem.name];
        });
        res.status(200).json(result);
    } catch (err) {
        res.status(404).json({ message: "Resource not found" });
    }
});

router.get('/models', async (req, res) => {
    try {
        const found = await Template.find({}).exec();
        const results = found.map(elem => ({
            name: elem.name,
            template: elem.template,
            format: elem.format,
        }));
        res.status(200).json({ message: "OK", data: results });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', router);
app.get(/^\/(?:index(?:.html?)?)?\/?$/, async (req, res) => {
    res.end("Reyah prototype.");
});

server.listen(parseInt(process.env.PORT || "3000"));
