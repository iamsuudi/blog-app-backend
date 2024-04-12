const { test, describe } = require('node:test');
const assert = require('node:assert');

const { totalLikes, favoriteBlog, mostBlogs, mostLikes } = require('../utils/helper');

describe('Total likes', () => {
    test('zero blogs', () => {
        const blogs = [];

        assert.strictEqual(totalLikes(blogs), 0);
    });

    test('more blogs with string-values likes', () => {
        const blogs = [
            {
                likes: '3',
            },
            {
                likes: '3',
            },
            {
                likes: '4',
            },
        ];

        assert.strictEqual(totalLikes(blogs), 10);
    });

    test('more blogs with mixed-values likes', () => {
        const blogs = [
            {
                likes: '3',
            },
            {
                likes: 3,
            },
            {
                likes: '4',
            },
        ];

        assert.strictEqual(totalLikes(blogs), 10);
    });
});

describe('Favorite blog', () => {
    test('zero blogs return - N/A', () => {
        const blogs = [];

        assert.strictEqual(favoriteBlog(blogs), 'N/A');
    });

    test('Many blogs with one most favorite', () => {
        const favorite = {
            title: 'most favorite',
            likes: '3',
        };

        const blogs = [
            favorite,
            {
                title: 'meduim favorite',
                likes: '2',
            },
            {
                title: 'least favorite',
                likes: '1',
            },
        ];

        assert.deepStrictEqual(favoriteBlog(blogs), favorite);
    });

    test('Many blogs with more than one most favorite', () => {
        const favorite1 = {
            title: 'first most favorite',
            likes: '3',
        };

        const favorite2 = {
            title: 'second most favorite',
            likes: '3',
        };

        const blogs = [
            favorite1,
            favorite2,
            {
                title: 'meduim favorite',
                likes: '2',
            },
            {
                title: 'least favorite',
                likes: '1',
            },
        ];

        const result = favoriteBlog(blogs);

        assert(
            result.title === 'first most favorite' ||
                result.title === 'second most favorite',
            'Return one of the most favorite blogs',
        );
    });
});

describe('Author with the most blogs', () => {
    test('There are no blogs - N/A', () => {
        const blogs = [];

        assert.strictEqual(mostBlogs(blogs), 'N/A');
    });

    test('There is one blog so return the author', () => {
        const blogs = [
            {
                title: 'javscript',
                author: 'suudi',
                url: 'iuoiu8',
                likes: '12',
            },
        ];

        assert.strictEqual(mostBlogs(blogs), 'suudi');
    });

    test('There is one most authored', () => {
        const blogs = [
            {
                title: 'javscript',
                author: 'suudi',
                url: 'iuoiu8',
                likes: '12',
            },
            {
                title: 'typescript',
                author: 'suudi',
                url: 'iuoiu8',
                likes: '12',
            },
            {
                title: 'python',
                author: 'suudi',
                url: 'iuoiu8',
                likes: '12',
            },
            {
                title: 'python',
                author: 'fato',
                url: 'iuoiu8',
                likes: '12',
            },
            {
                title: 'python',
                author: 'fato',
                url: 'iuoiu8',
                likes: '12',
            },
        ];

        assert.strictEqual(mostBlogs(blogs), 'suudi');
    });
});

describe('Author with the most likes', () => {
    test('There are no blogs - N/A', () => {
        const blogs = [];

        assert.strictEqual(mostLikes(blogs), 'N/A');
    });

    test('There is one blog so return the author', () => {
        const blogs = [
            {
                title: 'javscript',
                author: 'suudi',
                url: 'iuoiu8',
                likes: '12',
            },
        ];

        assert.strictEqual(mostLikes(blogs), 'suudi');
    });

    test('There is one most author with most likes', () => {
        const blogs = [
            {
                title: 'javscript',
                author: 'suudi',
                url: 'iuoiu8',
                likes: '12',
            },
            {
                title: 'typescript',
                author: 'suudi',
                url: 'iuoiu8',
                likes: '5',
            },
            {
                title: 'python',
                author: 'suudi',
                url: 'iuoiu8',
                likes: '23',
            },
            {
                title: 'python',
                author: 'fato',
                url: 'iuoiu8',
                likes: '89',
            },
            {
                title: 'python',
                author: 'fato',
                url: 'iuoiu8',
                likes: '89',
            },
        ];

        assert.strictEqual(mostLikes(blogs), 'fato');
    });
});
