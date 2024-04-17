const bcrypt = require('bcrypt');
const Blog = require('../models/blog');
const User = require('../models/user');
const config = require('../utils/config');

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
    {
        title: 'go is faster than python',
        author: 'Superuser',
        url: '09oip',
        likes: 9,
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

const nonExistingBlogId = async () => {
    const blog = new Blog({ title: 'will be removed soon', author: 'nobody' });

    await blog.save();
    await blog.deleteOne();
    return blog._id.toString();
};

const nonExistingUserId = async () => {
    const passwordHash = await bcrypt.hash('999', Number(config.saltRounds));

    const user = new User({
        username: 'iamnothing',
        name: 'nobody',
        password: passwordHash,
    });

    await user.save();
    await user.deleteOne();

    return user._id.toString();
};

const blogsInDb = async () => {
    const blogs = await Blog.find({});

    return blogs.map((blog) => blog.toJSON());
};

const usersInDb = async () => {
    const users = await User.find({});

    return users.map((user) => user.toJSON());
};

const registerUser = async (userData) => {
    const { username, name, password } = userData;

    const passwordHash = await bcrypt.hash(password, Number(config.saltRounds));

    const user = new User({ username, name, passwordHash });

    return user.save();
};

const resetUsers = async () => {
    await User.deleteMany({});

    await registerUser(initialUsers[0]);

    await registerUser(initialUsers[1]);

    return registerUser(initialUsers[2]);
};

const createBlog = async (blog) => {
    const user = await User.findOne({ username: 'root' });
    const userId = user._id.toString();

    const { title, author, url } = blog;
    let { likes } = blog;

    if (!likes) likes = 0;

    const newBlog = new Blog({
        title,
        author,
        url,
        likes,
        user: userId,
    });

    const savedBlog = await newBlog.save();

    return User.findByIdAndUpdate(userId, {
        username: user.username,
        name: user.name,
        passwordHash: user.passwordHash,
        blogs: user.blogs.concat(savedBlog._id),
    });
};

const resetBlogs = async () => {
    await Blog.deleteMany({});

    await createBlog(initialBlogs[0]);

    await createBlog(initialBlogs[1]);

    return createBlog(initialBlogs[2]);
};

module.exports = {
    initialBlogs,
    initialUsers,
    nonExistingUserId,
    nonExistingBlogId,
    blogsInDb,
    usersInDb,
    resetBlogs,
    resetUsers,
};
