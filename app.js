const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const bodyParser = require('body-parser');
const config = require('./config.js');

const authRouter = require('./routes/auth.js');
const exchangeRouter = require('./routes/exchange.js');
const profileRouter = require('./routes/profile.js');
const transactionRouter = require('./routes/transaction.js');
const path = require('path');

const app = express();

let passportGuard = passport.authenticate('jwt', { session: false });

app.use(passport.initialize());
require('./passport.js')(passport);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(authRouter);
app.use(passportGuard, exchangeRouter);
app.use(passportGuard, profileRouter);
app.use(passportGuard, transactionRouter);

async function startServer() {
	try {
		// стандартные опции
		let options = {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
			useFindAndModify: false
		};
		//  подключение к базе и прослушка
		await mongoose.connect(config.db, options);

		app.listen(config.PORT, () => {
			console.log(`Сервер запущен на порту: ${config.PORT} .`);
		});
	} catch (e) {
		console.log('Ошибка запуска:', e);
		process.exit(1);
	}
}

startServer();
