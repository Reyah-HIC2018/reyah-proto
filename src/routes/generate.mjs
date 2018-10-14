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
                reject(err);
            font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
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

router.get('/:id', async (req, res) => {
    const {id} = req.params;

    try {
        const tmplt = await Templates.findById(id).exec();
        const usr = JSON.parse(JSON.stringify(await Data.find({}).exec()));
        const data = {};

        tmplt.fields.forEach((elem) => {
            if (!usr[0][elem.name])
                return res.status(400).json({message: "Missing fields" })   
            data[elem.name] = usr[0][elem.name];
        });

        console.log(path.join("/static", tmplt.name + '_filled.jpg'));
        imageFill(tmplt, data, path.join("/static", tmplt.name + '_filled.jpg')); 
        res.redirect(path.join("/static", tmplt.name + '_filled.jpg'));
    } catch(err) {
        console.log(err);
        res.status(404).json({message: "Unknown model", path: path.join(__dirname, "..", tmplt.name + '_filled.jpg')})
    }
    
});

export default router;
