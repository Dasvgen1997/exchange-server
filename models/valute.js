const { Schema, model} = require('mongoose');

const schema = new Schema({
    valute: {type: String, required: true},
    amount: { type: String, required: true }
});

module.exports = model('Valute', schema);
