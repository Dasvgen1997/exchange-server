const { Router } = require('express');
const User = require('./../models/user.js');
const Valute = require('./../models/valute.js');
const authMiddleware = require('./../middlewares/auth.js');

const router = Router();

router.get('/profile', authMiddleware, async (req, res) => {
	try {
		let userId = req.user.userId;

		let resObj = {};

		let user = await User.findById(userId);

		resObj.user = {
			name: user.name,
			email: user.email,
			id: userId
		};

		await Valute.find().where('_id').in(user.wallet).exec((err, records) => {
			if (err) {
				res.status(400).json({ message: 'Не удалось загрузить кошелёк!' });
			}

			resObj.wallet = records;

			res.status(200).json(resObj);
		});
	} catch (e) {
		res.status(500).json({ message: 'Ошибка сервера. Попробуйте снова!', error: e });
	}
});

router.post('/profile', async (req, res) => {
	try {
		let valuteId = req.body.id;

		console.log(req.body)

		let valute = await Valute.findById(valuteId);

		await Valute.findByIdAndUpdate(valuteId, { amount: Number(valute.amount) + 100 }, async () => {
			res.status(200).json({ message: 'Valute added!' });
		});
	} catch (e) {
		res.status(500).json({ message: 'Ошибка сервера. Попробуйте снова!', error: e });
	}
});

module.exports = router;
