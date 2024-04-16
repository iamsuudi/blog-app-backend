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

    describe('addition of a new blog', async () => {
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
            userId: user._id.toString(),
        };

        test.skip('succeeds for a logged in user and valid blog data', async () => {
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

        test.skip('fails if user is not logged in and valid blog data', async () => {
            const newblog = {
                title: 'go is faster than python',
                author: 'Superuser',
                userId: helper.nonExistingId(),
            };

            await api
                .post('/api/blogs')
                .send(newblog)
                .set('Authorization', `Bearer ${token}`)
                .expect(401);

            const response = await api.get('/api/blogs');

            const titles = response.body.map((e) => e.title);

            assert.strictEqual(
                response.body.length,
                helper.initialBlogs.length,
            );

            assert(!titles.includes('go is faster than python'));
        });

        test.skip('fails with 400 if the blog title is missing', async () => {
            const inValidBlog = {
                author: 'abuki',
                url: '7890',
                likes: '',
                userId: user._id.toString(),
            };
            await api
                .post('/api/blogs')
                .send(inValidBlog)
                .set('Authorization', `Bearer ${token}`)
                .expect(400);

            const response = await api.get('/api/blogs');

            const contents = response.body.map((e) => e.title);

            assert.strictEqual(
                response.body.length,
                helper.initialBlogs.length,
            );

            assert(!contents.includes('go is faster than python'));
        });

        test.skip('fails with 400 if the blog author is missing', async () => {
            const inValidBlog = {
                title: 'data science is meh',
                url: '7890',
                likes: '',
                userId: user._id.toString(),
            };

            await api
                .post('/api/blogs')
                .send(inValidBlog)
                .set('Authorization', `Bearer ${token}`)
                .expect(400);

            const response = await api.get('/api/blogs');

            const contents = response.body.map((e) => e.title);

            assert.strictEqual(
                response.body.length,
                helper.initialBlogs.length,
            );

            assert(!contents.includes('data science is meh'));
        });

        test.skip('if the likes property is missing, it defaults to 0', async () => {
            await api
                .post('/api/blogs')
                .send(newBlog)
                .set('Authorization', `Bearer ${token}`)
                .expect(201);

            const response = await api.get(`/api/blogs`);

            assert.strictEqual(
                response.body.length,
                helper.initialBlogs.length + 1,
            );

            const likes = response.body.map((e) => e.likes);

            assert(likes.includes(0));
        });
    });

    describe('deletion of a blog', async () => {
        const user = await User.findOne({ username: 'root' });

        const newBlog = {
            title: 'go is faster than python',
            author: 'Superuser',
            url: '7890',
            likes: '',
            userId: user._id.toString(),
        };

        test.skip('succeeds with 204 for an authorized user and valid blog-id', async () => {
            const blogsAtStart = await helper.blogsInDb();

            const loginResponse = await api
                .post('/api/login')
                .send({ username: 'root', password: 'iamsuperuser' })
                .expect(200)
                .expect('Content-Type', /application\/json/);

            const { token } = loginResponse.body;

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

        test.skip('fails with 401 for an unauthorized user and valid blog-id', async () => {
            const blogsAtStart = await helper.blogsInDb();

            const loginResponse = await api
                .post('/api/login')
                .send({ username: 'root', password: 'iamsuperuser' })
                .expect(200)
                .expect('Content-Type', /application\/json/);

            const { token } = loginResponse.body;

            const person1LoginResponse = await api
                .post('/api/login')
                .send({ username: 'person1', password: 'iamperson1' })
                .expect(200)
                .expect('Content-Type', /application\/json/);

            const { person1Token } = person1LoginResponse.body;

            const savedResponse = await api
                .post('/api/blogs')
                .send(newBlog)
                .set('Authorization', `Bearer ${token}`)
                .expect(201)
                .expect('Content-Type', /application\/json/);

            const blogToBeDeleted = savedResponse.body;

            await api
                .delete(`/api/blogs/${blogToBeDeleted.id}`)
                .set('Authorization', `Bearer ${person1Token}`);

            const blogsAtEnd = await helper.blogsInDb();

            const titles = blogsAtEnd.map((e) => e.title);

            assert.strictEqual(blogsAtStart.length, blogsAtEnd.length - 1);
            assert(titles.includes(blogToBeDeleted.title));
        });

        test.skip('fails with 404 for non-existing blog-id', async () => {
            const nonExistingId = await helper.nonExistingId();

            const loginResponse = await api
                .post('/api/login')
                .send({ username: 'root', password: 'iamsuperuser' })
                .expect(200)
                .expect('Content-Type', /application\/json/);

            const { token } = loginResponse.body;

            await api
                .delete(`/api/blogs/${nonExistingId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(404);
        });

        test.skip('fails with 400 for invalid-format blog-id', async () => {
            const inValidId = '897tuy';

            const loginResponse = await api
                .post('/api/login')
                .send({ username: 'root', password: 'iamsuperuser' })
                .expect(200)
                .expect('Content-Type', /application\/json/);

            const { token } = loginResponse.body;

            await api
                .delete(`/api/blogs/${inValidId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(400);
        });
    });

    describe('updating of a blog', async () => {
        const user = await User.findOne({ username: 'root' });

        const newBlog = {
            title: 'go is faster than python',
            author: 'Superuser',
            url: '7890',
            likes: '',
            userId: user._id.toString(),
        };

        const updatedBlog = {
            title: 'go is way more faster than python',
            author: 'Superuser',
            url: '7890',
            likes: '',
            userId: user._id.toString(),
        };

        test('succeeds for an authorized user and valid blog-id', async () => {
            const loginResponse = await api
                .post('/api/login')
                .send({ username: 'root', password: 'iamsuperuser' })
                .expect(200);

            const { token } = loginResponse.body;

            const savedResponse = await api
                .post('/api/blogs')
                .send(newBlog)
                .set('Authorization', `Bearer ${token}`)
                .expect(201)
                .expect('Content-Type', /application\/json/);

            const blogToBeUpdated = savedResponse.body;

            await api
                .put(`/api/blogs/${blogToBeUpdated.id}`)
                .send(updatedBlog)
                .set('Authorization', `Bearer ${token}`);

            const blogsAtEnd = await helper.blogsInDb();

            const titles = blogsAtEnd.map((e) => e.title);

            assert(titles.includes(updatedBlog.title));
        });

        test('fails for an unauthorized user and valid blog-id', async () => {
            const loginResponse = await api
                .post('/api/login')
                .send({ username: 'root', password: 'iamsuperuser' })
                .expect(200);

            const { token } = loginResponse.body;

            const savedResponse = await api
                .post('/api/blogs')
                .send(newBlog)
                .set('Authorization', `Bearer ${token}`)
                .expect(201)
                .expect('Content-Type', /application\/json/);

            const blogToBeUpdated = savedResponse.body;

            const person1LoginResponse = await api
                .post('/api/login')
                .send({ username: 'person1', password: 'iamperson1' })
                .expect(200)
                .expect('Content-Type', /application\/json/);

            await api
                .put(`/api/blogs/${blogToBeUpdated.id}`)
                .send(updatedBlog)
                .set('Authorization', `Bearer ${person1LoginResponse.body.token}`);

            const blogsAtEnd = await helper.blogsInDb();

            const titles = blogsAtEnd.map((e) => e.title);

            assert(!titles.includes(updatedBlog.title));
        });

        test('fails with 404 for non-existing id', async () => {
            const nonExistingId = await helper.nonExistingId();

            const loginResponse = await api
                .post('/api/login')
                .send({ username: 'root', password: 'iamsuperuser' })
                .expect(200);

            const { token } = loginResponse.body;

            await api
                .post('/api/blogs')
                .send(newBlog)
                .set('Authorization', `Bearer ${token}`)
                .expect(201);

            await api
                .put(`/api/blogs/${nonExistingId}`)
                .send(updatedBlog)
                .set('Authorization', `Bearer ${token}`)
                .expect(404);
        });

        test('fails with 400 for invalid-format id', async () => {
            const inValidId = '897tuy';

            const loginResponse = await api
                .post('/api/login')
                .send({ username: 'root', password: 'iamsuperuser' })
                .expect(200);

            const { token } = loginResponse.body;

            await api
                .post('/api/blogs')
                .send(newBlog)
                .set('Authorization', `Bearer ${token}`)
                .expect(201);

            await api
                .put(`/api/blogs/${inValidId}`)
                .send(updatedBlog)
                .set('Authorization', `Bearer ${token}`)
                .expect(400);
        });
    });
});

after(async () => {
    await mongoose.connection.close();
});
