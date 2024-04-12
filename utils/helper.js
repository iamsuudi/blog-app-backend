const _ = require('lodash');

const findSum = (sum, blog) => sum + Number(blog.likes);

const totalLikes = (blogs) => blogs.reduce(findSum, 0);

const favoriteBlog = (blogs) => {
    let favorite = blogs.length > 0 ? { ...blogs[0] } : 'N/A';

    blogs.map((blog) => {
        if (Number(blog.likes) > Number(favorite.likes)) {
            favorite = { ...blog };
        }
        return 0;
    });

    return favorite;
};

const mostBlogs = (blogs) => {
    switch (blogs.length) {
        case 0:
            return 'N/A';
        case 1:
            return blogs[0].author;
        default: {
            const rawGroup = _.groupBy(blogs, (blog) => blog.author);

            const authors = Object.keys(rawGroup);

            const finalroup = authors.map((author) => {
                const posts = rawGroup[author].length;
                return { author, posts };
            });

            return _.maxBy(finalroup, (person) => person.posts).author;
        }
    }
};

const mostLikes = (blogs) => {
    switch (blogs.length) {
        case 0:
            return 'N/A';
        case 1:
            return blogs[0].author;
        default: {
            const rawGroup = _.groupBy(blogs, (blog) => blog.author);

            const authors = Object.keys(rawGroup);

            const finalroup = authors.map((author) => {
                const likes = rawGroup[author].reduce((sum, post) => sum + Number(post.likes), 0);
                return { author, likes };
            });

            return _.maxBy(finalroup, (person) => person.likes).author;
        }
    }
}

module.exports = { totalLikes, favoriteBlog, mostBlogs, mostLikes };
