const Blog = require('../models/blog');

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

const nonExistingId = async () => {
    const blog = new Blog({ title: 'will be removed soon', author: 'nobody' });

    await blog.save();
    await blog.deleteOne();
    return blog._id.toString();
};

const blogsInDb = async () => {
    const blogs = await Blog.find({});

    return blogs.map(blog => blog.toJSON());
}

module.exports = {
    initialBlogs,
    nonExistingId,
    blogsInDb
}