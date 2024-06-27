const Blog = require('../models/blog');

const getAllBlogs = async (req, res) => {
    const { user } = req;
    let blogs;

    if (!user) {
        blogs = await Blog.find({});
    } else {
        blogs = await Blog.find({}).populate('user');
    }

    return res.status(200).json(blogs);
};

const createBlog = async (req, res) => {
    const { user } = req;

    const savedBlog = await Blog.create({
        ...req.body,
        date: new Date(),
        user: user._id,
    });

    res.status(201).json(savedBlog);
};

const getBlog = async (req, res) => {
    const { user } = req;
    const { blogId } = req.params;

    let blog;

    if (!user) {
        blog = await Blog.findById(blogId);
    } else {
        blog = await Blog.findById(blogId).populate('user');
    }

    return res.status(200).json(blog);
};

const deleteBlog = async (req, res) => {
    const { user } = req;
    const { blogId } = req.params;

    const blog = await Blog.findById(blogId);

    if (user._id.toString() !== blog.user.toString()) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    await Blog.findByIdAndDelete(blogId);

    return res.status(204).json({ message: 'Deleted' });
};

/* eslint consistent-return: 0 */
const updateBlog = async (req, res) => {
    const { user } = req;
    const { blogId } = req.params;
    const update = req.body;

    const blog = await Blog.findById(blogId);

    if (user._id.toString() !== blog.user.toString()) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(blogId, update);

    return res.json(updatedBlog);
};

module.exports = {
    updateBlog,
    deleteBlog,
    getBlog,
    createBlog,
    getAllBlogs,
};
