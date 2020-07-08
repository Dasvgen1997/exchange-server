const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const config = require('./config.js');
const passport = require('passport');
const User = require('./models/user.js');

const options = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: config.jwtKey
};

module.exports = (passport) => {
	passport.use(
	new JwtStrategy(options, async (payload, done) => {
			try {
				const user = await User.findById(payload.userId).select('email id');

				if (user) {
					done(null, user);
				} else {
					done(null, false);
				}
			} catch (e) {
				console.log(e);
			}
		})
	);
};
