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

                const { email, name, picture } = profile;

                let user = await User.findOne({ email });

                if (!user) {
                    user = new User({
                        ...name,
                        email,
                        picture,
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

async function updateUserGithub(user, github, githubId) {
    let updatedUser;
    if (user) {
        if (githubId !== user.githubId) {
            updatedUser = await User.findOneAndUpdate({ github }, { githubId });
        } else if (github !== user.github) {
            updatedUser = await User.findOneAndUpdate({ githubId }, { github });
        }
    }
    return updatedUser;
}

async function findOrCreateUser(github, githubId, displayName, _json) {
    let user = await User.findOne({ github });

    if (!user) user = await User.findOne({ githubId });

    if (user) {
        // update github field if needed
        user = await updateUserGithub(user, github, githubId);
    } else {
        const [givenName = '', familyName = ''] = displayName.split(' ');
        user = await User.create({
            github,
            githubId,
            givenName,
            familyName,
            picture: _json.avatar_url,
        });
    }

    return user;
}

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

                const { profileUrl, displayName, id, _json } = profile;

                const user = await findOrCreateUser(
                    profileUrl,
                    id,
                    displayName,
                    _json,
                );

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

                const passwordCorrect = user.passwordHash
                    ? bcrypt.compare(password, user.passwordHash)
                    : false;
                if (!passwordCorrect)
                    return done(null, false, { message: 'Incorrect password' });

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        },
    ),
);
