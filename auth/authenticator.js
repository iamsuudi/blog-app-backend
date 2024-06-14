const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const logger = require('../utils/logger');

passport.serializeUser((user, done) => {
    logger.info('Inside serializer');
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        logger.info('Inside deserializer');
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

module.exports = passport.use(
    new LocalStrategy(
        { usernameField: 'email' },
        async (email, password, done) => {
            try {
                const user = await User.findOne({ email });
                if (!user) throw new Error('Incorrect email');

                const passwordCorrect = bcrypt.compare(
                    password,
                    user.passwordHash,
                );
                if (!passwordCorrect) throw new Error('Incorrect password');

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        },
    ),
);
