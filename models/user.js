const { Schema, model, Types} = require('mongoose');

const schema = new Schema({
	email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: {type: String, required: true},
    wallet: [{type: Types.ObjectId, ref: 'Valute'}],
    history: [{type: Types.ObjectId, ref: 'Transaction'}]
});

module.exports = model('User', schema);
