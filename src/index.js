const express = require("express");
const http = require("http");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const server = http.createServer(app);

mongoose.connect("mongodb://hic:hicpass@dyj1.reyah.ga:27017", {useNewUrlParser: true});
console.log(mongoose.connection.readyState);

const Users = mongoose.model('User', require('./mongoose/Users.js'));
const Template = mongoose.model('Template', require('./mongoose/Template.js'));

Users.findOne({username: "needlex"}, (err, usr) => {
    if (err) {return console.error(err);}
    usr.testfield = "repgergerpgorpokr";
    console.log(usr);
    usr.save();
    console.log(usr);
});

// Template.create({name: "test", template: "iejfiozefjozefji", format: "jpg", fields: [ { name: "testfield", x1: 10, y1: 10, x2: 40, y2: 40 } ],})

const router = express.Router();
router.post('/model/:name', async (req, res) => {
    if (!req.body.template || !req.body.metadata) {res.status(400).json({message: "Missing data"});}
    Template.create({
        name: req.params.name,
        template: req.body.template,
        fields: req.body.metadata
    }, (err, usr) => {
        if (err) {return res.status(500).json({message: err});}
        res.status(200).json({message: "OK"});
    });
    
});

router.get('/models/:name', async (req, res) => {
    Template.findOne({name: req.params.name}, (err, template) => {
        if (err || !template) {return res.status(404).json({message: "Resource not found"});}
        const result = {
            name: template.name,
            template: template.template,
            format: template.format,
            fields: template.fields
        }
        Users.findOne({username: 'needlex'}, (err, user) => {
            result.fields.forEach((elem)=>{
                result.fields.value = user[elem.name];
            });
        })
        res.status(200).json(result);
    });
});

router.get('/models', async (req, res) => {
    const results = [];
    Template.find({}, (err, templates) => {
        if (err) {return res.status(500).json({message: err});}
        templates.forEach((elem) => {
            console.log(elem);
            results.push({
                name: elem.name,
                template: elem.template,
                format: elem.format,
            });
        });
        res.status(200).json({message: "OK", data: results});
    });
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', router);
app.get(/^\/(?:index(?:.html?)?)?\/?$/, async (req, res) => {
    res.end("Reyah prototype.");
});

server.listen(parseInt(process.env.PORT || 3000));
