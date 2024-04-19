const supertest = require('supertest');
const mongoose = require('mongoose');
const { test, describe, beforeEach, after } = require('node:test');
const assert = require('node:assert');
const app = require('../app');
const helper = require('./test_helper');

const api = supertest(app);

describe('when there is initial one user in db', () => {
    beforeEach(async () => {
        await helper.resetUsers();

        await helper.resetBlogs();
    });

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            username: 'abdulfetah',
            name: 'Abdulfetah Suudi',
            password: 'iamsuudi',
        };

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/);

        const usersAtEnd = await helper.usersInDb();
        assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

        const usernames = usersAtEnd.map((u) => u.username);
        assert(usernames.includes(newUser.username));
    });

    test('creation fails with proper status code if username is already taken', async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            username: 'root',
            name: 'Abdulfetah Suudi',
            password: 'iamsuudi',
        };

        await api.post('/api/users').send(newUser).expect(400);

        const usersAtEnd = await helper.usersInDb();
        assert.strictEqual(usersAtEnd.length, usersAtStart.length);
    });

    test('creation fails with proper status code if username is missing', async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            name: 'Abdulfetah Suudi',
            password: 'iamsuudi',
        };

        await api.post('/api/users').send(newUser).expect(400);

        const usersAtEnd = await helper.usersInDb();
        assert.strictEqual(usersAtEnd.length, usersAtStart.length);
    });

    test('creation fails with proper status code if password is missing', async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            username: 'abdu',
            name: 'Abdulfetah Suudi',
        };

        await api.post('/api/users').send(newUser).expect(400);

        const usersAtEnd = await helper.usersInDb();
        assert.strictEqual(usersAtEnd.length, usersAtStart.length);
    });
});

after(async () => {
    await mongoose.connection.close();
});
