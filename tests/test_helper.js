const Blog = require('../models/blog');
const User = require('../models/user');

const initialBlogs = [
    {
        title: 'javascript is awesome lang',
        author: 'suudi',
        url: 'iuoiu8',
        likes: 12,
    },
    {
        title: 'typescript is admired lang',
        author: 'fato',
        url: 'iuoiu8',
        likes: 5,
    },
];

const initialUsers = [
    {
        username: 'root',
        name: 'Superuser',
        password: 'iamsuperuser',
    },
    {
        username: 'person1',
        name: 'Person1',
        password: 'iamperson1',
    },
    {
        username: 'person2',
        name: 'Person2',
        password: 'iamperson2',
    },
];

const nonExistingId = async () => {
    const blog = new Blog({ title: 'will be removed soon', author: 'nobody' });

    await blog.save();
    await blog.deleteOne();
    return blog._id.toString();
};

const blogsInDb = async () => {
    const blogs = await Blog.find({});

    return blogs.map((blog) => blog.toJSON());
};

const usersInDb = async () => {
    const users = await User.find({});

    return users.map((user) => user.toJSON());
};

module.exports = {
    initialBlogs,
    initialUsers,
    nonExistingId,
    blogsInDb,
    usersInDb,
};
