import express from "express";
import Jimp from "jimp";
import path from "path";
import { writeFile, readdir } from "fs";
import { promisify } from "util";
import uuid from "uuid/v4";
import Data from "../mongoose/Data.mjs";
import Templates from "../mongoose/Templates.mjs";

const write_file = promisify(writeFile);
const read_dir = promisify(readdir);

export const router = express.Router();

async function genThumb(file_path) {
    return new Promise((resolve, reject) => {
        Jimp.read(file_path, async (err, file) => {
            if (err)
                return reject(err);
            const thumb = path.parse(file_path);
            file.resize(210, 297).write(path.join(thumb.dir, thumb.name + '_thumb' + thumb.ext));
            return resolve();
        });
    });
}

router.put("/:id", async (req, res) => {
    const { data } = req.body;
    if (data == undefined)
        return res.status(400).json({ error: "Missing data" });

    try {
        await Promise.all(
            Object.entries(data).map(([key, val]) => {
                console.log(`Updating ${key}`);
                return Data.updateOne({}, { [key]: val }).exec();
            }));
        res.status(200).json(data);
    } catch (error) {
        res.status(400).json({ error });
    }
});

router.post("/:name", async (req, res) => {
    const { template, metadata: fields } = req.body;
    const { name } = req.params;

    if (!template || !fields || !name)
        return res.status(400).json({ error: "Missing data" });
    try {
        const files = await read_dir("static");
        const path = (() => {
            let path;
            do {
                path = uuid();
            } while (files.includes(path));
            return path;
        })();
        await write_file(`static/${path}.jpg`, Buffer.from(template.split(",")[1], "base64"));
        await genThumb(`static/${path}.jpg`);
        await Templates.create({ name, path: `static/${path}`, fields, format: "jpg" });
        res.status(200).json({ name, path: `static/${path}`, fields, format: "jpg" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const results = await Templates.findById(id).exec()
            .then(({ name, path, fields, format }) => ({
                name,
                format,
                path: `${path}.${format}`,
                thumb: `${path}_thumb.${format}`,
                fields: fields.map(({ name, value }) => ({ name, value }))
            }));
        const user = JSON.parse(JSON.stringify((await Data.findOne({}).exec())));
        results.fields.forEach(elem => {
            const found = user.fields.find(el => el.name == elem.name);
            if (found)
                elem.value = found.value;
        });
        res.status(200).json(results);
    } catch (error) {
        console.error(error);
        res.status(404).json({ error });
    }
});

router.get("/", async (req, res) => {
    try {
        const data = await Templates.find({}).exec()
            .then(arr =>
                arr.map(({ name, template, format, path, _id }) => ({
                    id: _id,
                    name,
                    template,
                    format,
                    path: `${path}.${format}`,
                    thumb: `${path}_thumb.${format}`
                })));
        res.status(200).json({ data });
    } catch (error) {
        res.status(500).json({ error });
    }
});

export default router;
