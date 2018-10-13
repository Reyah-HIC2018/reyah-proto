import express from "express";
import { writeFile, readdir } from "fs";
import { promisify } from "util";
import uuid from "uuid/v4";
import Data from "../mongoose/Data.mjs";
import Templates from "../mongoose/Templates.mjs";

const write_file = promisify(writeFile);
const read_dir = promisify(readdir);

export const router = express.Router();

router.put("/:name", async (req, res) => {
    const { data } = req.body;
    if (data == undefined)
        return res.status(400).json({ message: "Missing data" });
    try {
        await Promise.all(
            Object.entries(data).map(([key, val]) =>
                Data.updateOne({  }, { [key]: val }).exec()));
        res.status(400).json({ message: "OK" });
    } catch (err) {
        res.status(400).json({ message: err });
    }
});

router.post("/:name", async (req, res) => {
    const { template, metadata: fields } = req.body;
    const { name } = req.params;

    if (!template || !fields || !name)
        return res.status(400).json({ message: "Missing data" });
    try {
        const files = await read_dir("static");
        const path = (() => {
            let path;
            do {
                path = `${uuid()}.jpg`;
            } while (files.includes(path));
            return path;
        })();
        await write_file(`static/${path}`, Buffer.from(template.split(",")[1], "base64"));
        await Templates.create({ name, path, fields, format: "jpg" });
        res.status(200).json({ message: "OK" });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const results = await Templates.findById(id).exec()
            .then(({ name, template, fields, format }) =>
                ({ name, template, fields: fields.map(({ name, value }) =>
                    ({ name, value })), format }));
        const user = await Data.find({  }).exec();
        results.fields.forEach(elem => { results.fields.value = user[elem.name]; });
        res.status(200).json(results);
    } catch (err) {
        console.error(err);
        res.status(404).json({ message: "Resource not found" });
    }
});

router.get("/", async (req, res) => {
    try {
        const data = await Templates.find({}).exec()
            .then(arr => arr.map(({ name, template, format, _id }) =>
                ({ name, template, format, id: _id })));
        res.status(200).json({ data });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

export default router;
