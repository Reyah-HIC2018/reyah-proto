import express from "express";
import { writeFile, readdir } from "fs";
import { promisify } from "util";
import uuid from "uuid/v4";
import Users from "../mongoose/Users.mjs";
import Templates from "../mongoose/Templates.mjs";

const write_file = promisify(writeFile);
const read_dir = promisify(readdir);

export const router = express.Router();

router.put('/:name', async (req, res) => {
    const { data } = req.body;
    if (data == undefined)
        return res.status(400).json({ message: "Missing data" });
    try {
        console.log(`data: ${(await import("util")).inspect(data, { depth: null })}`);
        await Promise.all(
            Object.entries(data).map(([key, val]) =>
                Users.updateOne({ username: "needlex" }, { [key]: val }).exec()));
        res.status(400).json({ message: "OK" });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: err });
    }
});

router.post('/:name', async (req, res) => {
    const { template, metadata: fields } = req.body;
    const { name } = req.params;

    console.log(req.body);

    if (!template || !fields || !name)
        return res.status(400).json({ message: "Missing data" });
    try {
        const files = await read_dir("../../static");
        const path = (() => {
            let path;
            do {
                path = `${uuid()}.jpg`;
            } while (files.includes(path));
            return path;
        })();
        await write_file(`../../static/${path}`, template);
        await Templates.create({ name, path, fields });
        res.status(200).json({ message: "OK" });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

router.get('/:name', async (req, res) => {
    try {
        const result = await Templates.findOne({ name: req.params.name }).exec();
        const user = await Users.findOne({ username: 'needlex' }).exec();
        result.fields.forEach(elem => {
            result.fields.value = user[elem.name];
        });
        res.status(200).json(result);
    } catch (err) {
        res.status(404).json({ message: "Resource not found" });
    }
});

router.get('/', async (req, res) => {
    try {
        const results = await Templates.find({}).exec();
        res.status(200).json({ message: "OK", data: results });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

export default router;
