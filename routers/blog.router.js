const express = require('express');
const blogController = require('../controllers/blogs.controller');
const uploadBlogThumbnail = require('../middlewares/uploadBlogThumbnail');
const Blog = require('../models/blog');

const blogRouter = express.Router();

blogRouter.get('/blogs', blogController.getAllBlogs);
blogRouter.post('/blogs', blogController.createBlog);

blogRouter.get('/blogs/:blogId', blogController.getBlog);
blogRouter.delete('/blogs/:blogId', blogController.deleteBlog);
blogRouter.put('/blogs/:blogId', blogController.updateBlog);

blogRouter.put(
    '/blogs/:blogId/thumbnail',
    (req, res, next) => {
        console.log({ file: req.file });
        next();
    },
    uploadBlogThumbnail,
    async (req, res) => {
        const { blogId } = req.params;
        const { thumbnail } = req;
        await Blog.findByIdAndUpdate(blogId, { thumbnail });
        console.log('Thumbnail uploaded and updated successfully');
        res.sendStatus(204);
    },
    blogController.updateBlog,
);

module.exports = blogRouter;
