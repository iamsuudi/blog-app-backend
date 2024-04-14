const { test, describe, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const helper = require('./test_helper');

const api = supertest(app);

describe('when there is initially some blogs saved', () => {
    beforeEach(async () => {
        await Blog.deleteMany({});

        await Blog.insertMany(helper.initialBlogs);
    });

    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/);
    });

    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs');
        assert.strictEqual(response.body.length, helper.initialBlogs.length);
    });

    describe('viewing a specific blog', () => {
        test.skip('succeeds with a valid id', async () => {
            const blogsAtStart = await helper.blogsInDb();

            const blogToView = blogsAtStart[0];

            const response = await api
                .get(`/api/blogs/${blogToView.id}`)
                .expect(200)
                .expect('Content-Type', /application\/json/);

            assert.deepStrictEqual(response.body, blogToView);
        });

        test.skip('fails with 404 for non-existing valid-format id', async () => {
            const nonExistingId = await helper.nonExistingId();

            await api.get(`/api/blogs/${nonExistingId}`).expect(404);
        });

        test.skip('fails with 400 for invalid-format id', async () => {
            const invalidId = 'yuio7898ed';

            await api.get(`/api/blogs/${invalidId}`).expect(400);
        });
    });

    describe('addition of a new blog', () => {
        test.skip('succeeds with a valid blog data', async () => {
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

            const contents = response.body.map((e) => e.title);

            assert.strictEqual(
                response.body.length,
                helper.initialBlogs.length + 1,
            );

            assert(contents.includes('go is faster than python'));
        });

        test.skip('fails with 400 if title is missing', async () => {
            const newBlog = {
                author: 'abuki',
                url: '7890',
                likes: '',
            };

            await api.post('/api/blogs').send(newBlog).expect(400);

            const response = await api.get('/api/blogs');

            const contents = response.body.map((e) => e.title);

            assert.strictEqual(
                response.body.length,
                helper.initialBlogs.length,
            );

            assert(!contents.includes('go is faster than python'));
        });

        test.skip('fails with 400 if author is missing', async () => {
            const newBlog = {
                title: 'data science is meh',
                url: '7890',
                likes: '',
            };

            await api.post('/api/blogs').send(newBlog).expect(400);

            const response = await api.get('/api/blogs');

            const contents = response.body.map((e) => e.title);

            assert.strictEqual(
                response.body.length,
                helper.initialBlogs.length,
            );

            assert(!contents.includes('data science is meh'));
        });

        test.skip('if the likes property is missing, it defaults to 0', async () => {
            const blog = { title: 'nextjs', author: 'suudi' };

            await api.post('/api/blogs').send(blog).expect(201);

            const response = await api.get(`/api/blogs`);

            const likes = response.body.map((e) => e.likes.toString());

            assert(likes.includes('0'));
        });
    });

    describe('deletion of a blog', () => {
        test.skip('succeeds with 204 for valid id', async () => {
            const blogsAtStart = await helper.blogsInDb();

            const blogToBeDeleted = blogsAtStart[0];

            await api.delete(`/api/blogs/${blogToBeDeleted.id}`).expect(204);

            const blogsAtEnd = await helper.blogsInDb();

            assert.strictEqual(
                blogsAtEnd.length,
                helper.initialBlogs.length - 1,
            );

            const titles = blogsAtEnd.map((e) => e.title);

            assert(!titles.includes(blogToBeDeleted.title));
        });

        test.skip('fails with 404 for non-existing id', async () => {
            const nonExistingId = await helper.nonExistingId();

            await api.delete(`/api/blogs/${nonExistingId}`).expect(404);
        });

        test.skip('fails with 400 for invalid-format id', async () => {
            const inValidId = '897tuy';

            await api.delete(`/api/blogs/${inValidId}`).expect(400);
        });
    });

    describe('updating of a blog', async () => {
        test.skip('succeeds for valid id', async () => {
            const blogsAtStart = await helper.blogsInDb();

            const blogBefore = {
                ...blogsAtStart[0],
                title: 'updated title',
                author: 'whoever',
            };

            await api.put(`/api/blogs/${blogBefore.id}`).send(blogBefore);

            const blogsAtEnd = await helper.blogsInDb();

            const titles = blogsAtEnd.map((e) => e.title);

            assert(titles.includes(blogBefore.title));
        });

        test.skip('fails with 404 for non-existing id', async () => {
            const nonExistingId = await helper.nonExistingId();

            const blogsAtStart = await helper.blogsInDb();

            const blogBefore = {
                ...blogsAtStart[0],
                title: 'updated title',
                author: 'whoever',
            };

            await api
                .put(`/api/blogs/${nonExistingId}`)
                .send(blogBefore)
                .expect(404);
        });

        test.skip('fails with 400 for invalid-format id', async () => {
            const inValidId = '897tuy';

            const blogsAtStart = await helper.blogsInDb();

            const blogBefore = {
                ...blogsAtStart[0],
                title: 'updated title',
                author: 'whoever',
            };

            await api
                .put(`/api/blogs/${inValidId}`)
                .send(blogBefore)
                .expect(400);
        });
    });
});

after(async () => {
    await mongoose.connection.close();
});
