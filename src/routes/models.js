const router = require('express').Router();
const { Users, Templates } = require('../index');

router.put('/:name', async (req, res) => {
    const data = req.body.data;
    try {
        const user = await Users.findOne({ username: "needlex" }).exec();
        Object.assign(user, data);
        user.save();
        res.status(400).json({ message: "OK" });
    } catch (err) {
        res.status(400).json({ message: err });
    }
});

router.post('/:name', async (req, res) => {
    const { Templates, metadata } = req.body;
    if (!Templates || !metadata)
        return res.status(400).json({ message: "Missing data" });
    try {
        await Templates.create({
            name: req.params.name,
            Templates: req.body.Templates,
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
            Templates: found.Templates,
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
            Templates: elem.Templates,
            format: elem.format,
        }));
        res.status(200).json({ message: "OK", data: results });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

module.exports = router;