const { test, describe } = require('node:test');
const assert = require('node:assert');

const { totalLikes } = require('../utils/helper');

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