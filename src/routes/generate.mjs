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
            const font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
            for (const field of template.fields)
                if (data[field.name])
                    file.print(font, field.x1, field.y1, {
                        text: data[field.name],
                        alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
                        alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM
                    });
            file.write(output);
            return resolve();
        });
    });
}

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const tmplt = await Templates.findById(id).exec();
        const usr = JSON.parse(JSON.stringify(await Data.findOne({}).exec()));
        const data = {};

        tmplt.path = tmplt.path + "." + tmplt.format;
        tmplt.fields.forEach(elem => {
            const found = usr.fields.find(el => el.name == elem.name);
            if (found == undefined)
                return res.status(400).json({message: "Missing fields", usr: usr })
            data[found.name] = found.value;
        });

        await imageFill(tmplt, data, path.join("static", tmplt.name + '_filled.jpg'));
        res.redirect(path.join("/static", tmplt.name + '_filled.jpg'));
    } catch(err) {
        res.status(404).json({message: "Unknown model"})
    }
});

export default router;
