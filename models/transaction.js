const { Schema, model} = require('mongoose');

const schema = new Schema({
    date:{type: String, required: true} ,
    sent_valute: {type: String, required: true},
    receive_valute: {type: String, required: true},
    sent_amount: {type: String, required: true},
    receive_amount: {type: String, required: true}
});

module.exports = model('Transaction', schema);
