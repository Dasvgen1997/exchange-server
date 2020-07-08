const { Router } = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('./../config.js');
const { validationResult, check } = require('express-validator');
const User = require('./../models/user.js');
const Valute = require('./../models/valute.js');

const router = Router();

// регистрация

router.post(
	'/signup',
	[
		check('email', 'Введите Email!').isEmail(),
		check('password', 'Минимальная длина пароля: 6 символов!').isLength({ min: 6 }),
		check('name', 'Минимальная длина имени: 6 символов!').isLength({ min: 6 })
	],
	async (req, res) => {
		try {
			// валидация данных
			const errors = validationResult(req);

			if (!errors.isEmpty()) {
				return res.status(400).json({ message: errors.array()[0].msg });
			}

			const { email, password, name } = req.body;

			const potentialUser = await User.findOne({ email: email });

			if (potentialUser) {
				// если потенциальный юзер есть в бд
				return res.status(400).json({ message: 'Данный email уже зарегестрирован!' });
			}

			// хэширование пароля
			const hashedPassword = await bcryptjs.hash(password, 11);

			// создание в бд
			const valute = new Valute({ valute: 'USD', amount: 12 });

			await valute.save();

			const user = new User({ email: email, name: name, password: hashedPassword, wallet: [ valute.id ] });

			await user.save();

			return res.status(201).json({ message: 'Пользователь создан!' });
		} catch (e) {
			res.status(500).json({ message: 'Ошибка сервера. Попробуйте снова!', error: e });
		}
	}
);

// авторизация
router.post(
	'/signin',
	
	async (req, res) => {
		try {
			// валидация данных
	

			const { email, password } = req.body;

			const user = await User.findOne({ email: email });

			if (!user) {
				return res.status(400).json({ message: 'Неверный логин или пароль!' });
			}

			const checkPassword = await bcryptjs.compare(password, user.password);

			console.log(checkPassword);

			if (!checkPassword) {
				return res.status(400).json({ message: 'Неверный логин или пароль!' });
			}

			const token = jwt.sign({ userId: user.id }, config.jwtKey, { expiresIn: '1h' });

			res.status(200).json({
				token,
				userId: user.id
			});
		} catch (e) {
			console.log(e);
			res.status(400).json({ message: 'Ошибка сервера. Попробуйте снова!', error: e });
		}
	}
);

module.exports = router;
