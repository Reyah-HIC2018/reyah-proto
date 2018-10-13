import express from "express";
import jimp from "jimp";
import path from "path";
import Templates from "../mongoose/Templates.mjs";
import Users from "../mongoose/Users.mjs";
import config from "../config.mjs"

const dirname = "static";
const router = express.Router();

async function imageFill(template, data, output) {
    return new Promise((resolve, reject) => {
        jimp.read(`${config.templates_folder}/${template.path}`, async (err, file) => {
            if (err) {
                reject(err);
                return;
            }
            const font = await jimp.loadFont(jimp.FONT_SANS_32_WHITE);
            for (const field of template.metadata) {
                const { value } = data.find(({ field }) => field == field.name);
                if (value)
                    file.print(font, field.x1, field.y1, {
                        text: value,
                        alignmentX: jimp.HORIZONTAL_ALIGN_LEFT,
                        alignmentY: jimp.VERTICAL_ALIGN_BOTTOM
                    });
            }
            file.write(output);
            resolve();
        });
    });
}


router.get("/:template", async (req, res) => {
    const { template } = req.body;

    try {
        const tmplt = await Templates.findOne({ template }).exec();
        const usr = await Users.findOne({ username: "needlex" }).exec();
        const data = {};

        tmplt.fields.forEach(({ name }) => {
            if (!usr[name])
                return res.status(400).json({ message: "Missing fields" });
            data[name] = usr[name];
        });

        imageFill(tmplt, data, path.join(dirname, tmplt.name + "_filled.jpg"));
        res.redirect(path.join(dirname, tmplt.name + "_filled.jpg"));
    } catch (err) {
        res.status(404).json({ message: "Unknown model" });
    }

});

export default router;
