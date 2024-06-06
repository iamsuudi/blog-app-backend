const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const config = require('../utils/config');

/* eslint consistent-return: 0, no-underscore-dangle: 0 */
export const signin = async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    const passwordCorrect =
        user === null ? false : bcrypt.compare(password, user.passwordHash);

    if (!(user && passwordCorrect)) {
        return res.status(401).json({ error: 'invalid username or password' });
    }

    const userForToken = {
        username: user.username,
        id: user._id,
    };

    const token = jwt.sign(userForToken, config.SECRET, { expiresIn: 60 * 60 });

    res.status(200).send({
        token,
        username: user.username,
        name: user.name,
    });
};

export const signup = async (req, res, next) => {
    const { username, name, password } = req.body;

    if (!password) res.status(400).json({ error: 'password missing' });

    const passwordHash = await bcrypt.hash(password, Number(config.saltRounds));

    const user = new User({
        username,
        name,
        passwordHash,
    });

    const savedUser = await user.save();

    if (savedUser) res.status(201).json(savedUser);

    next();
};