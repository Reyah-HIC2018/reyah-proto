import express from "express";
import Users from "../mongoose/Users.mjs";
import Templates from "../mongoose/Templates.mjs";

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
    const { template, metadata } = req.body;
    if (!template || !metadata)
        return res.status(400).json({ message: "Missing data" });
    try {
        await Templates.create({
            name: req.params.name,
            Templates: req.body.template,
            fields: req.body.metadata
        });
        res.status(200).json({ message: "OK" });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

router.get('/:name', async (req, res) => {
    try {
        const found = await Templates.findOne({ name: req.params.name }).exec();
        const result = {
            name: found.name,
            path: found.path,
            format: found.format,
            fields: found.fields
        }
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
        const found = await Templates.find({}).exec();
        const results = found.map(elem => ({
            name: elem.name,
            path: elem.path,
            format: elem.format,
        }));
        res.status(200).json({ message: "OK", data: results });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

export default router;
