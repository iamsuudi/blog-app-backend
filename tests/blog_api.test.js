const { test, describe, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const helper = require('./test_helper');

const api = supertest(app);

describe('Blog api', () => {

    beforeEach(async () => {
        await Blog.deleteMany({});

        for (let blog of helper.initialBlogs) {
            await blog.save();
        }
    });

    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/);
    });

    test('there are two blogs', async () => {
        const response = await api.get('/api/blogs');
        assert.strictEqual(response.body.length, helper.initialBlogs.length);
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

        assert.strictEqual(response.body.length, helper.initialBlogs.length + 1);

        assert(contents.includes('go is faster than python'));
    });

    test('a blog without title is not added', async () => {
        const newBlog = {
            author: 'abuki',
            url: '7890',
            likes: '',
        };

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400);

        const response = await api.get('/api/blogs');

        const contents = response.body.map(e => e.title);

        assert.strictEqual(response.body.length, helper.initialBlogs.length);

        assert(!contents.includes('go is faster than python'));
    });

    test('a blog without author is not added', async () => {
        const newBlog = {
            title: 'data science is meh',
            url: '7890',
            likes: '',
        };

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400);

        const response = await api.get('/api/blogs');

        const contents = response.body.map(e => e.title);

        assert.strictEqual(response.body.length, helper.initialBlogs.length);

        assert(!contents.includes('data science is meh'));
    });

});

after(async () => {
    await mongoose.connection.close();
});
