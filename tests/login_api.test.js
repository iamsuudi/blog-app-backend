const { test, describe, beforeEach, after } = require('node:test');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const helper = require('./test_helper');

const api = supertest(app);

describe('when there is already a root user created', () => {
    beforeEach(async () => {
        await helper.resetUsers();

        await helper.resetBlogs();
    });

    test('succeeds when the existing (regsitered) user logs in', async () => {
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

    test('fails when the unknown (non registered) user tries to login', async () => {
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
