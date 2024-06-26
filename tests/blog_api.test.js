const { test, describe, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const helper = require('./test_helper');
const User = require('../models/user');

const api = supertest(app);

describe('when there is initially some blogs saved', () => {
    beforeEach(async () => {
        await helper.resetUsers();
        await helper.resetBlogs();
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
        test('succeeds with a valid id', async () => {
            const blogsAtStart = await helper.blogsInDb();

            const blogToView = blogsAtStart[0];

            const response = await api
                .get(`/api/blogs/${blogToView.id}`)
                .expect(200)
                .expect('Content-Type', /application\/json/);

            assert.strictEqual(response.body.title, blogToView.title);
        });

        test('fails with 404 for non-existing valid-format id', async () => {
            const nonExistingId = await helper.nonExistingBlogId();

            await api.get(`/api/blogs/${nonExistingId}`).expect(404);
        });

        test('fails with 400 for invalid-format id', async () => {
            const invalidId = 'yuio7898ed';

            await api.get(`/api/blogs/${invalidId}`).expect(400);
        });
    });

    describe('addition of a new blog', async () => {
        test('succeeds for a logged in user and valid blog data', async () => {
            // take snapshot of the blogs on start to check with the end
            const blogsAtStart = await helper.blogsInDb();

            // select root user to extract his id
            const user = await User.findOne({ username: 'root' });

            // login the root user
            const loginResponse = await api
                .post('/api/login')
                .send({ username: 'root', password: 'iamsuperuser' })
                .expect(200)
                .expect('Content-Type', /application\/json/);

            // get the token
            const { token } = loginResponse.body;

            const newBlog = {
                title: 'this is a new blog',
                author: 'Superuser',
                userId: user._id.toString(),
            };

            // create the new blog with his token
            await api
                .post('/api/blogs')
                .send(newBlog)
                .set('Authorization', `Bearer ${token}`)
                .expect(201)
                .expect('Content-Type', /application\/json/);

            // take snapshot of the blogs at end of the action
            const blogsAtEnd = await helper.blogsInDb();

            // assert the number of the blogs are incremented
            assert.strictEqual(blogsAtEnd.length, blogsAtStart.length + 1);

            // assert the new added title belongs to the end snapshot
            const contents = blogsAtEnd.map((e) => e.title);
            assert(contents.includes(newBlog.title));
        });

        test('fails if user is not logged in and valid blog data', async () => {
            // take snapshot of the blogs on start to check with the end
            const blogsAtStart = await helper.blogsInDb();

            // no user is logged in at the start of every test
            const user = await User.findOne({ username: 'root' });

            const newblog = {
                title: 'super freaky',
                author: 'Superuser',
                userId: user._id.toString(),
            };

            await api.post('/api/blogs').send(newblog).expect(401);

            // take snapshot of the blogs at end of the action
            const blogsAtEnd = await helper.blogsInDb();

            // assert the number of the blogs stays the same
            assert.strictEqual(blogsAtEnd.length, blogsAtStart.length);

            // assert the new added title doesn't belong to the end snapshot
            const contents = blogsAtEnd.map((e) => e.title);
            assert(!contents.includes(newblog.title));
        });

        test('fails with 400 if the blog title is missing', async () => {
            const blogsAtStart = await helper.blogsInDb();

            const user = await User.findOne({ username: 'root' });

            const loginResponse = await api
                .post('/api/login')
                .send({ username: 'root', password: 'iamsuperuser' })
                .expect(200)
                .expect('Content-Type', /application\/json/);

            const { token } = loginResponse.body;

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

            // take snapshot of the blogs at end of the action
            const blogsAtEnd = await helper.blogsInDb();

            // assert the number of the blogs stays the same
            assert.strictEqual(blogsAtEnd.length, blogsAtStart.length);
        });

        test('fails with 400 if the blog author is missing', async () => {
            const blogsAtStart = await helper.blogsInDb();

            const user = await User.findOne({ username: 'root' });

            const loginResponse = await api
                .post('/api/login')
                .send({ username: 'root', password: 'iamsuperuser' })
                .expect(200)
                .expect('Content-Type', /application\/json/);

            const { token } = loginResponse.body;

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

            // take snapshot of the blogs at end of the action
            const blogsAtEnd = await helper.blogsInDb();

            // assert the number of the blogs stays the same
            assert.strictEqual(blogsAtEnd.length, blogsAtStart.length);
        });

        test('if the likes property is missing, it defaults to 0', async () => {
            const blogsAtStart = await helper.blogsInDb();

            const user = await User.findOne({ username: 'root' });

            const loginResponse = await api
                .post('/api/login')
                .send({ username: 'root', password: 'iamsuperuser' })
                .expect(200)
                .expect('Content-Type', /application\/json/);

            const { token } = loginResponse.body;

            const newBlog = {
                title: 'this is a new blog',
                author: 'Superuser',
                userId: user._id.toString(),
            };
            await api
                .post('/api/blogs')
                .send(newBlog)
                .set('Authorization', `Bearer ${token}`)
                .expect(201);

            const blogsAtEnd = await helper.blogsInDb();

            assert.strictEqual(blogsAtEnd.length, blogsAtStart.length + 1);

            const likes = blogsAtEnd.map((e) => e.likes);

            assert(likes.includes(0));
        });
    });

    describe('deletion of a blog', async () => {
        test('succeeds with 204 for an authorized user and valid blog-id', async () => {
            const blogsAtStart = await helper.blogsInDb();

            const blogToBeDeleted = blogsAtStart[0];

            const loginResponse = await api
                .post('/api/login')
                .send({ username: 'root', password: 'iamsuperuser' })
                .expect(200)
                .expect('Content-Type', /application\/json/);

            const { token } = loginResponse.body;

            await api
                .delete(`/api/blogs/${blogToBeDeleted.id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(204);

            const blogsAtEnd = await helper.blogsInDb();

            const titles = blogsAtEnd.map((e) => e.title);

            assert.strictEqual(blogsAtStart.length, blogsAtEnd.length + 1);
            assert(!titles.includes(blogToBeDeleted.title));
        });

        test('fails with 401 for an unauthorized user and valid blog-id', async () => {
            const blogsAtStart = await helper.blogsInDb();

            const blogToBeDeleted = blogsAtStart[0];

            await api
                .post('/api/login')
                .send({ username: 'root', password: 'iamsuperuser' })
                .expect(200)
                .expect('Content-Type', /application\/json/);

            const person1LoginResponse = await api
                .post('/api/login')
                .send({ username: 'person1', password: 'iamperson1' })
                .expect(200)
                .expect('Content-Type', /application\/json/);

            const { person1Token } = person1LoginResponse.body;

            await api
                .delete(`/api/blogs/${blogToBeDeleted.id}`)
                .set('Authorization', `Bearer ${person1Token}`);

            const blogsAtEnd = await helper.blogsInDb();

            const titles = blogsAtEnd.map((e) => e.title);

            assert.strictEqual(blogsAtStart.length, blogsAtEnd.length);
            assert(titles.includes(blogToBeDeleted.title));
        });

        test('fails with 404 for non-existing blog-id', async () => {
            const nonExistingId = await helper.nonExistingBlogId();

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

        test('fails with 400 for invalid-format blog-id', async () => {
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
        const updatedBlog = {
            title: 'this is updated blog',
            author: 'Superuser',
        };
        test('succeeds for an authorized user and valid blog-id', async () => {
            const loginResponse = await api
                .post('/api/login')
                .send({ username: 'root', password: 'iamsuperuser' })
                .expect(200);

            const { token } = loginResponse.body;

            const blogsAtStart = await helper.blogsInDb();

            const blogToBeUpdated = blogsAtStart[0];

            await api
                .put(`/api/blogs/${blogToBeUpdated.id}`)
                .send(updatedBlog)
                .set('Authorization', `Bearer ${token}`);

            const blogsAtEnd = await helper.blogsInDb();

            const titles = blogsAtEnd.map((e) => e.title);

            assert(titles.includes(updatedBlog.title));
        });

        test('fails for an unauthorized user and valid blog-id', async () => {
            const blogsAtStart = await helper.blogsInDb();

            const blogToBeUpdated = blogsAtStart[0];

            const person1LoginResponse = await api
                .post('/api/login')
                .send({ username: 'person1', password: 'iamperson1' })
                .expect(200)
                .expect('Content-Type', /application\/json/);

            await api
                .put(`/api/blogs/${blogToBeUpdated.id}`)
                .send(updatedBlog)
                .set(
                    'Authorization',
                    `Bearer ${person1LoginResponse.body.token}`,
                )
                .expect(401);

            const blogsAtEnd = await helper.blogsInDb();

            const titles = blogsAtEnd.map((e) => e.title);

            assert(!titles.includes(updatedBlog.title));
        });

        test('fails with 404 for non-existing id', async () => {
            const nonExistingId = await helper.nonExistingBlogId();

            const loginResponse = await api
                .post('/api/login')
                .send({ username: 'root', password: 'iamsuperuser' })
                .expect(200);

            const { token } = loginResponse.body;

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
