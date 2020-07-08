const { Router } = require('express');
const moment = require('moment');
const requestify = require('requestify');
const parseString = require('xml2js').parseString;
const Valute = require('./../models/valute.js');
const User = require('./../models/user.js');
const Transaction = require('./../models/transaction.js');
const authMiddleware = require('./../middlewares/auth.js');

const parseNum = require('./../utils/parseNumber.js');

const router = Router();

router.get('/exchange', authMiddleware, async (req, res) => {
	let userId = req.user.userId;

	let resObj = {};

	try {
		let user = await User.findById(userId);

		await Valute.find().where('_id').in(user.wallet).exec(async (err, records) => {
			if (err) {
				res.status(400).json({ message: 'Не удалось загрузить кошелёк!' });
			}

			resObj.wallet = records;
		});

		await getCurrentValute().then((list) => {
			resObj.valute = list;

			res.status(200).json(resObj);
		});
	} catch (e) {
		res.status(400).json({ message: 'Ошибка сервера!', e });
	}
});

async function getCurrentValute() {
	try {
		let list;

		await requestify
			.get(`http://www.cbr.ru/scripts/XML_daily.asp?date_req=${moment().format('DD/MM/YYYY')}`)
			.then(function(res) {
				parseString(res.body, function(err, result) {
					if (err) {
						res.status(400).json({
							error: 'Ошибка запроса к ЦБ!'
						});
					}

					let valuteArray = result.ValCurs.Valute;

					let valuteFiltered = [];

					for (let p = 0; p < valuteArray.length; p++) {
						let valute = valuteArray[p].CharCode[0];

						if (valute == 'EUR' || valute == 'USD' || valute == 'GBP') {
							let price = valuteArray[p].Value[0];
							valuteFiltered.push({
								valute,
								price
							});
						}
					}

					list = valuteFiltered;
				});
			});
		return list;
	} catch (e) {
		res.status(400).json({ message: 'Не удалось загрузить валюту!', e });
	}
}

router.post('/exchange', authMiddleware, async (req, res) => {
	try {
		let reqReceiveCode = req.body.received;
		let reqSentId = req.body.sent;
		let reqReceiveAmount = parseNum(req.body.amount);

		console.log(reqReceiveCode);
		console.log(reqSentId);
		console.log(reqReceiveAmount);

		let userId = req.user.userId;

		let sentValute = await Valute.findById(reqSentId);

		let valuteList;

		await getCurrentValute().then((list) => {
			valuteList = list;
		});

		let sentPrice;
		let receivePrice;

		// price valutes

		for (let p = 0; p < valuteList.length; p++) {
			if (sentValute.valute == valuteList[p].valute) {
				sentPrice = valuteList[p].price;
			}
			if (reqReceiveCode == valuteList[p].valute) {
				receivePrice = valuteList[p].price;
			}
		}

		let availableAmount = parseNum(receivePrice) * reqReceiveAmount;

		let subSent = parseNum(availableAmount) / parseNum(sentPrice);

		let user = await User.findById(userId);

		// user wallet each

		await Valute.find().where('_id').in(user.wallet).exec(async (err, records) => {
			let addId;

			records.forEach((item) => {
				if (item.valute == reqReceiveCode) {
					addId = item._id;
				}
			});

			// 	// sub in user wallet
			let newAmount = parseNum(sentValute.amount) - parseNum(subSent);

			console.log(parseNum(newAmount));
			await Valute.findByIdAndUpdate(sentValute._id, { amount: parseNum(newAmount) }, async () => {
				console.log('sub in user wallet');
			});

			// create valute in wallet
			if (!Boolean(addId)) {
				let newValute = new Valute({ valute: reqReceiveCode, amount: reqReceiveAmount });
				await newValute.save();

				await User.findByIdAndUpdate(user._id, { wallet: [ ...user.wallet, newValute._id ] }, async () => {
					console.log('save new valute in wallet');
				});
			} else {
				let valute = await Valute.findById(addId);

				await Valute.findByIdAndUpdate(
					addId,
					{ amount: parseNum(parseNum(valute.amount) + reqReceiveAmount) },
					async () => {
						console.log('update in wallet');
					}
				);
			}

			// 	// add history in user

			let transaction = new Transaction({
				date: moment().format('l'),
				sent_valute: sentValute.valute,
				receive_valute: reqReceiveCode,
				sent_amount: parseNum(subSent),
				receive_amount: reqReceiveAmount
			});

			await transaction.save();

			await User.findByIdAndUpdate(user._id, { history: [ ...user.history, transaction._id ] }, async () => {
				console.log('save in history');
			});

			res.status(200).json({
				message: 'Ok!'
			});
		});
	} catch (e) {
		console.log(e);
		res.status(400).json({ message: 'Ошибка сервера!', e });
	}
});

module.exports = router;
