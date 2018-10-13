const Schema = require('mongoose').Schema;

const Template = new Schema ({
        name: String,
        template: String,
        format: String,
        fields: [ { name: String, x1: Number, y1: Number, x2: Number, y2: Number } ],
});

module.exports =  Template;