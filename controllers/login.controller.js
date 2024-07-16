const bcrypt = require('bcrypt');
const User = require('../models/user');
const config = require('../utils/config');
const logger = require('../utils/logger');

const signup = async (req, res, next) => {
    const { email, password } = req.body;

    if (!password) return res.status(400).json({ error: 'password missing' });

    const passwordHash = await bcrypt.hash(
        password,
        Number(config.SALT_ROUNDS),
    );

    await User.create({
        email,
        passwordHash,
    });

    next();
};

const logout = async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    req.logout((error) => {
        if (error) return res.sendStatus(400);
        res.sendStatus(200);
    });
};

const authResponse = async (req, res) => {
    logger.info({ user: req.user });
    return res.status(200).send('User is authenticated');
};

module.exports = {
    signup,
    logout,
    authResponse,
};
