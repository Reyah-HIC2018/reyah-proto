const express = require("express");
const http = require("http");
var Jimp = require('jimp');

const app = express();
const server = http.createServer(app);

app.use(express.static('public'));


// 367 550 721 30 prénom de l'enfant
// 356 597 271 25 date de naissance de l'enfant
// 336 646 101 21 groupe sanguin de l'enfant
// 260 682 363 28 pédiatre de l'enfant
// 685 691 402 18 téléphone du pédiatre
// 482 723 609 31 assurance maladie
// 265 861 750 23 adresse du domicile
// 251 898 377 31 ville du domicile
// 339 954 288 22 téléphone du domicile
// 450 1075 639 29 nom et prénom de la mère
// 278 1121 350 29 profession de la mère
// 305 1168 528 22 téléphone pro de la mère
// 850 1167 235 25 téléphone perso de la mère
// 423 1257 663 23 nom et prénom du père
// 277 1300 352 22 profession du père
// 295 1347 339 19 téléphone pro du père
// 845 1350 242 22 téléphone perso du père

const config = {
    templates_folder: "templates",
    font: Jimp.FONT_SANS_32_BLACK
}

const template_model = {
    path: "Crèche-register.jpg",
    metadata : [
        {name: "prénom de l'enfant", x1: 367, y1: 550, x2: 721, y2: 30},
        {name: "date de naissance de l'enfant", x1: 356, y1: 593, x2: 271, y2: 25},
        {name: "groupe sanguin de l'enfant", x1: 336, y1: 636, x2: 101, y2: 21},
        {name: "pédiatre de l'enfant", x1: 260, y1: 682, x2: 363, y2: 28},
        {name: "téléphone du pédiatre", x1: 685, y1: 681, x2: 402, y2: 18},
        {name: "assurance maladie et accident", x1: 482, y1: 723, x2: 609, y2: 31},
        {name: "adresse du domicile", x1: 265, y1: 857, x2: 750, y2: 23},
        {name: "ville du domicile", x1: 251, y1: 898, x2: 377, y2: 31},
        {name: "téléphone du domicile", x1: 339, y1: 945, x2: 288, y2: 22},
        {name: "nom et prénom de la mère", x1: 450, y1: 1075, x2: 639, y2: 29},
        {name: "profession de la mère", x1: 278, y1: 1121, x2: 350, y2: 29},
        {name: "téléphone pro de la mère", x1: 305, y1: 1165, x2: 328, y2: 22},
        {name: "téléphone perso de la mère", x1: 850, y1: 1165, x2: 235, y2: 25},
        {name: "nom et prénom du père", x1: 423, y1: 1253, x2: 663, y2: 23},
        {name: "profession du père", x1: 277, y1: 1297, x2: 352, y2: 22},
        {name: "téléphone pro du père", x1: 295, y1: 1340, x2: 339, y2: 19},
        {name: "téléphone perso du père", x1: 845, y1: 1340, x2: 242, y2: 22}
    ]
}

const data_model = [
    {field: "prénom de l'enfant", value: "Cédric"},
    {field: "date de naissance de l'enfant", value: "16/01/1998"},
    {field: "groupe sanguin de l'enfant", value: "0+"},
    {field: "pédiatre de l'enfant", value: "Dr. Industry"},
    {field: "téléphone du pédiatre", value: "03 88 41 86 95"},
    {field: "assurance maladie et accident", value: "LMDE"},
    {field: "adresse du domicile", value: "8 rue de palerme"},
    {field: "ville du domicile", value: "Starsbourg"},
    {field: "téléphone du domicile", value: "03 88 00 62 64"},
    {field: "nom et prénom de la mère", value: "Daenerys Targaryen"},
    {field: "profession de la mère", value: "Reine"},
    {field: "téléphone pro de la mère", value: "06 86 23 61 98"},
    {field: "téléphone perso de la mère", value: "06 86 23 62 98"},
    {field: "nom et prénom du père", value: "Jon Snow"},
    {field: "profession du père", value: "Souffre douleur"},
    {field: "téléphone pro du père", value: "06 86 41 61 98"},
    {field: "téléphone perso du père", value: "06 86 23 14 98"}
]

async function imageFill(template, data, output) {
    return new Promise((resolve, reject) => {
        Jimp.read(`${config.templates_folder}/${template.path}`, async (err, file) => {
            if (err) 
                throw err;
            font = await Jimp.loadFont(config.font);
            for (let field of template.metadata) {
                let profile_elem = data.find((metadata) => {
                    return metadata.field == field.name;
                });
                if (profile_elem) {
                    file.print(font, field.x1, field.y1, {
                        text: profile_elem.value,
                        alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
                        alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM
                      });
                }
            }
            file.write(output);
            resolve();
        });
    });
}

app.get(/^\/(?:index(?:.html?)?)?\/?$/, async (req, res) => {
    await imageFill(template_model, data_model, "public/save.jpg");
    res.setHeader("Content-Type", "text/html")
    res.send("<html><img src='save.jpg'> </html>");
});

server.listen(parseInt(process.env.PORT || "3000"));
