const { test, describe, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const helper = require('./test_helper');
const User = require('../models/user');

const api = supertest(app);

describe('when there is initially some blogs saved', () => {
    beforeEach(async () => {
        await Blog.deleteMany({});

        await Blog.insertMany(helper.initialBlogs);
    });

    test.skip('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/);
    });

    test.skip('all blogs are returned', async () => {
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
        test('succeeds with a user and valid blog data', async () => {
            const user = await User.findOne({ username: 'root' });

            const loginResponse = await api
                .post('/api/login')
                .send({ username: 'root', password: 'iamsuperuser' })
                .expect(200)
                .expect('Content-Type', /application\/json/);

            const { token } = loginResponse.body;

            const newBlog = {
                title: 'go is faster than python',
                author: 'Superuser',
                url: '7890',
                likes: '',
                userId: user._id.toString(),
            };

            await api
                .post('/api/blogs')
                .send(newBlog)
                .set('Authorization', `Bearer ${token}`)
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
        test('succeeds with 204 for the right user and valid id', async () => {
            const blogsAtStart = await helper.blogsInDb();

            const user = await User.findOne({ username: 'root' });

            const loginResponse = await api
                .post('/api/login')
                .send({ username: 'root', password: 'iamsuperuser' })
                .expect(200)
                .expect('Content-Type', /application\/json/);

            const { token } = loginResponse.body;

            const newBlog = {
                title: 'go is faster than python',
                author: 'Superuser',
                url: '7890',
                likes: '',
                userId: user._id.toString(),
            };

            const savedResponse = await api
                .post('/api/blogs')
                .send(newBlog)
                .set('Authorization', `Bearer ${token}`)
                .expect(201)
                .expect('Content-Type', /application\/json/);

            const blogToBeDeleted = savedResponse.body;

            await api
                .delete(`/api/blogs/${blogToBeDeleted.id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(204);

            const blogsAtEnd = await helper.blogsInDb();

            const titles = blogsAtEnd.map((e) => e.title);

            assert.strictEqual(blogsAtStart.length, blogsAtEnd.length);
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
