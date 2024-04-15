const { test, describe, beforeEach, after } = require('node:test');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const supertest = require('supertest');
const app = require('../app');
const config = require('../utils/config');
const helper = require('./test_helper');
const User = require('../models/user');

const api = supertest(app);

describe('when there is already a root user created', () => {
    beforeEach(async () => {
        await User.deleteMany({});

        const { username, name, password } = helper.initialUsers[0];

        const passwordHash = await bcrypt.hash(
            password,
            Number(config.saltRounds),
        );

        const user = new User({ username, name, passwordHash });

        await user.save();
    });

    test('succeeds when the root user logs in', async () => {
        const user = {
            username: 'root',
            password: 'iamsuperuser',
        };

        await api
            .post('/api/login')
            .send(user)
            .expect(200)
            .expect('Content-Type', /application\/json/);
    });

    test('fails when the unknown user tries to login', async () => {
        const user = {
            username: 'abdulfetah',
            password: 'iamsuudi',
        };

        await api
            .post('/api/login')
            .send(user)
            .expect(401);
    });
});

after(async () => {
    await mongoose.connection.close();
});
