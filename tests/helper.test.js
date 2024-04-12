const { test, describe } = require('node:test');
const assert = require('node:assert');

const { totalLikes, favoriteBlog } = require('../utils/helper');

describe('Total likes', () => {
    test('zero blogs', () => {
        const blogs = [];

        assert.strictEqual(totalLikes(blogs), 0)
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
})

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

        assert(result.title === 'first most favorite' || result.title === 'second most favorite', 'Return one of the most favorite blogs');
    });

})