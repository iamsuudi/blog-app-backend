const { test, describe, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');

const api = supertest(app);

const initialBlogs = [
    {
        title: 'javascript is awesome lang',
        author: 'suudi',
        url: 'iuoiu8',
        likes: '12',
    },
    {
        title: 'typescript is admired lang',
        author: 'fato',
        url: 'iuoiu8',
        likes: '5',
    },
];

describe('Blog api', () => {
    beforeEach(async () => {
        // console.log('before deleting', await api.get('/api/blogs').body.length);
        await Blog.deleteMany({});
        // console.log('after deleting', await api.get('/api/blogs').body.length);
        let blogObject = new Blog(initialBlogs[0]);
        await blogObject.save();
        blogObject = new Blog(initialBlogs[1]);
        await blogObject.save();
        // console.log('after populating', await api.get('/api/blogs').body.length);
    });

    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/);
    });

    test('there are two blogs', async () => {
        const response = await api.get('/api/blogs');
        assert.strictEqual(response.body.length, initialBlogs.length);
    });

    test('the first blogs is about javascript lang', async () => {
        const response = await api.get('/api/blogs');

        const titles = response.body.map((e) => e.title);
        assert(titles.includes('javascript is awesome lang'));
    });

    test('a valid blog can be added', async () => {
        const newBlog = {
            title: 'go is faster than python',
            author: 'abuki',
            url: '7890',
            likes: '',
        };

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/);

        const response = await api.get('/api/blogs');

        const contents = response.body.map(e => e.title);

        assert.strictEqual(response.body.length, initialBlogs.length + 1);

        assert(contents.includes('go is faster than python'));
    });
});

after(async () => {
    await mongoose.connection.close();
});
