const Blog = require('../models/blog');
const User = require('../models/user');

export const getAllBlogs = async (req, res) => {
    if (!req.user) {
        console.log('could not find the user');
        return res.status(401).json({ error: 'token invalid' });
    }

    const blogs = await Blog.find({}).populate('user', {
        username: 1,
        name: 1,
    });

    res.status(200).json(blogs);
};

export const createBlog = async (req, res, next) => {
    const { title, author, url } = req.body;
    let { likes } = req.body;

    if (!req.user) {
        console.log('could not find the user');
        return res.status(401).json({ error: 'token invalid' });
    }

    const user = await User.findById(req.user);

    if (!likes) likes = 0;

    const newBlog = new Blog({
        title,
        author,
        url,
        likes,
        user: req.user,
    });

    const savedBlog = await newBlog.save();

    if (savedBlog) {
        await User.findByIdAndUpdate(req.user, {
            username: user.username,
            name: user.name,
            passwordHash: user.passwordHash,
            blogs: user.blogs.concat(savedBlog._id),
        });

        res.status(201).json(savedBlog);
    }
    next();
};

export const getBlog = async (req, res, next) => {
    const blog = await Blog.findById(req.params.id);

    if (blog) {
        res.json(blog);
    } else {
        // res.status(400).end();
        next();
    }
};

export const deleteBlog = async (req, res, next) => {
    const blog = await Blog.findById(req.params.id);

    if (!blog) next();

    const userId = blog.user.toString();

    if (!req.user || req.user !== userId) {
        // console.log('decoded id: ', typeof decodedToken.id, decodedToken.id);
        // console.log('user id: ', typeof userId, userId);
        return res.status(401).json({ error: 'token invalid' });
    }

    const deleted = await Blog.findByIdAndDelete(req.params.id);

    if (deleted) res.status(204).json(deleted);

    next();
};

/* eslint consistent-return: 0 */
export const updateBlog = async (req, res, next) => {
    const blogExist = await Blog.findById(req.params.id);

    if (!blogExist) next();

    const blog = { ...req.body };

    const userId = blogExist.user.toString();

    if (!req.user || req.user !== userId) {
        // console.log('decoded id: ', typeof decodedToken.id, decodedToken.id);
        // console.log('user id: ', typeof userId, userId);
        return res.status(401).json({ error: 'token invalid' });
    }
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, blog, {
        new: true,
        runValidators: true,
    });

    if (updatedBlog) return res.json(updatedBlog.toJSON());

    next();
};
