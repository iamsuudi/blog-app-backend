const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const { Strategy: GoogleStrategy } = require('passport-google-oauth2');
const { Strategy: GithubStrategy } = require('passport-github2');
const User = require('../models/user');
const logger = require('../utils/logger');
const config = require('../utils/config');

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

/* eslint prefer-arrow-callback: 0 camelcase: 0 */
passport.use(
    new GoogleStrategy(
        {
            clientID: config.GOOGLE_CLIENT_ID,
            clientSecret: config.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/redirect',
        },
        async function verify(accessToken, refreshToken, profile, done) {
            try {
                // Get user's email from profile

                const { email, given_name, family_name } = profile;

                let user = await User.findOne({ email });

                if (!user) {
                    user = new User({
                        given_name,
                        family_name,
                        email,
                    });
                    await user.save();
                }

                done(null, user);
            } catch (err) {
                done(err, null);
            }
        },
    ),
);

/* eslint prefer-arrow-callback: 0 */
passport.use(
    new GithubStrategy(
        {
            clientID: config.GITHUB_CLIENT_ID,
            clientSecret: config.GITHUB_CLIENT_SECRET,
            callbackURL: '/api/auth/github/redirect',
        },
        async function verify(accessToken, refreshToken, profile, done) {
            try {
                // Get user's email from profile
                const { profileUrl, displayName } = profile;

                let user = await User.findOne({ github: profileUrl });

                if (!user) {
                    user = new User({
                        github: profileUrl,
                        given_name: displayName.split(' ')[0] || '',
                        family_name: displayName.split(' ')[1] || '',
                    });
                    await user.save();
                }

                done(null, user);
            } catch (err) {
                done(err, null);
            }
        },
    ),
);

passport.use(
    new LocalStrategy(
        { usernameField: 'email' },
        async (email, password, done) => {
            try {
                const user = await User.findOne({ email });
                if (!user)
                    return done(null, false, { message: 'Incorrect email' });

                const passwordCorrect = await bcrypt.compare(
                    password,
                    user.passwordHash,
                );
                if (!passwordCorrect)
                    return done(null, false, { message: 'Incorrect password' });

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        },
    ),
);
