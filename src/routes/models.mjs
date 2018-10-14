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
                reject(err);
            const thumb = path.parse(file_path);
            file.resize(210, 297).write(path.join(thumb.dir, thumb.name + '_thumb' + thumb.ext));     
            resolve();
        });
    });
}


router.put("/:id", async (req, res) => {
    const { data } = req.body;
    console.log(data, req.body);
    if (data === undefined)
        return res.status(400).json({ error: "missing data" });
    try {
        await Promise.all(
            Object.entries(data).map(([key, val]) =>
                Data.updateOne({  }, { [key]: val }).exec()));
        res.status(400).json(data);
    } catch (err) {
        res.status(400).json({ error: err });
    }
});

router.post("/:name", async (req, res) => {
    const { template, metadata: fields } = req.body;
    const { name } = req.params;

    if (!template || !fields || !name)
        return res.status(400).json({ error: "missing data" });
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
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err });
    }
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const results = await Templates.findById(id).exec()
            .then(({ name, path, fields, format }) =>
                ({ name, path, thumb: `${path}_thumb`, fields: fields.map(({ name, value }) =>
                    ({ name, value })), format }));
        const user = await Data.find({  }).exec();
        results.fields.forEach(elem => {
            if (elem.name in user)
                results.fields.value = user[elem.name];
        });
        res.status(200).json(results);
    } catch (err) {
        console.error(err);
        res.status(404).json({ error: "resource not found" });
    }
});

router.get("/", async (req, res) => {
    try {
        const data = await Templates.find({}).exec()
            .then(arr => arr.map(({ name, template, format, path, _id }) =>
                ({ name, template, format, path, thumb: `${path}_thumb`, id: _id })));
        res.status(200).json({ data });
    } catch (err) {
        res.status(500).json({ error: err });
    }
});

export default router;
