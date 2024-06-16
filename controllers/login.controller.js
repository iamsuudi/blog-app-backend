const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const config = require('../utils/config');

/* eslint consistent-return: 0, no-underscore-dangle: 0 */
const signin = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    const passwordCorrect =
        user === null ? false : bcrypt.compare(password, user.passwordHash);

    if (!(user && passwordCorrect)) {
        return res.status(401).json({ error: 'invalid email or password' });
    }

    const userForToken = {
        email: user.email,
        id: user._id,
    };

    const token = jwt.sign(userForToken, config.SECRET, { expiresIn: 60 * 60 });

    res.status(200).send({
        token,
        email: user.email,
        name: user.name,
    });
};

const signup = async (req, res, next) => {
    const { email, password } = req.body;

    if (!password) return res.status(400).json({ error: 'password missing' });

    const passwordHash = await bcrypt.hash(
        password,
        Number(config.SALT_ROUNDS),
    );

    const user = await User.create({
        email,
        passwordHash,
    });

    // if (user) return res.status(201).json(user);

    next();
};

module.exports = {
    signin,
    signup,
};
