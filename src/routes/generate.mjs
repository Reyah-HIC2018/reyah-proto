import express from "express";
import Users from "../mongoose/Users.mjs";
import Templates from "../mongoose/Templates.mjs";
import path from "path";

const dirname = 'static'
const router = express.Router();

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


router.get('/:template', async (req, res) => {
    const {template} = req.body;

    try {
        const tmplt = await Templates.findOne({template}).exec();
        const usr = await Users.findOne({username: "needlex"}).exec();
        const data = {};
        
        tmplt.fields.foreach((elem) => {
            if (!usr[elem.name])
                return res.status(400).json({message: "Missing fields" })
            data[elem.name] = usr[elem.name];
        });

        imageFill(tmplt, data, path.join(dirname, tmplt.name + '_filled.jpg'));
        res.redirect(path.join(dirname, tmplt.name + '_filled.jpg'));
    
    } catch {
        res.status(404).json({message: "Unknown model"})
    }
    
});

export default router;
