import express from "express";
import Data from "../mongoose/Data.mjs";
import Templates from "../mongoose/Templates.mjs";
import path from "path";
import Jimp from 'jimp';

const router = express.Router();

async function imageFill(template, data, output) {
    return new Promise((resolve, reject) => {
        Jimp.read(`${template.path}`, async (err, file) => {
            if (err) 
                return reject(err);
            const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
            for (let field of template.fields) {
                if (data[field.name]) {
                    file.print(font, field.x1, field.y1, {
                        text: data[field.name],
                        alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
                        alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM
                      });
                }
            }
            file.write(output);
            return resolve();
        });
    });
}

router.get('/:id', async (req, res) => {
    const {id} = req.params;
    try {

        const tmplt = await Templates.findById(id).exec();
        const usr = JSON.parse(JSON.stringify(await Data.find({}).exec()));
        const data = [];

        tmplt.fields.forEach((elem) => {
            if (!usr[0][elem.name])
                return res.status(400).json({message: "Missing fields", usr: usr })
            const obj = {};
            obj[data[elem.name]] = usr[0][elem.name];
            obj.x1 = elem.x1;
            obj.x2 = elem.x2;
            obj.y1 = elem.y1;
            obj.y2 = elem.y2;
            data.push(obj);
        });

        console.log(tmplt);
        imageFill(tmplt, data, path.join("static", tmplt.name + '_filled.jpg'));
        res.redirect(path.join("/static", tmplt.name + '_filled.jpg'));
    } catch(err) {
        console.log(err);
        res.status(404).json({message: "Unknown model", path: path.join("/static", tmplt.name + '_filled.jpg')})
    }
    
});

export default router;
