const findSum = (sum, blog) => sum + Number(blog.likes);

const totalLikes = (blogs) => blogs.reduce(findSum, 0);

const favoriteBlog = (blogs) => {
    let favorite = { ...blogs[0] };

    blogs.map((blog) => {
        if (Number(blog.likes) > Number(favorite.likes)) {
            favorite = { ...blog };
        }
        return 0;
    });

    return favorite;
};

module.exports = { totalLikes, favoriteBlog };
