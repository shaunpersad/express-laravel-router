"use strict";
const laravelToExpress = require('../lib/laravelToExpress');

describe('laravelToExpress(uri:string[, patterns:object]):string', function() {

    it('should convert Laravel-style urls with params to express-style', function() {

        const laravelUrls = [
            '/foo',
            '/{foo}',
            '/foo/{bar}',
            '/foo/{bar}/{baz}',
            '/foo/{bar}/baz/{qux}',
            '/foo/{bar?}'
        ];
        const results = [
            '/foo',
            '/:foo',
            '/foo/:bar',
            '/foo/:bar/:baz',
            '/foo/:bar/baz/:qux',
            '/foo/:bar?'
        ];

        laravelUrls.forEach((url, index) => {

            const expressUrl = laravelToExpress(url);

            if (results[index] !== expressUrl) {

                throw new Error(`"${url}" did not convert to "${results[index]}". Got "${expressUrl}" instead.`);
            }

        });

    });

    it('should convert regex patterns to express-style regexes in the url', function() {

        const laravelUrl = '/{foo}/{bar}/{baz}';
        const patterns = {
            foo: /^[a-zA-Z]*$/,
            bar: /^\d+$/,
            baz: /^\w+$/
        };
        const result = '/:foo([a-zA-Z]*)/:bar(\\d+)/:baz(\\w+)';
        const expressUrl = laravelToExpress(laravelUrl, patterns);

        if (expressUrl !== result) {

            throw new Error(`"${laravelUrl}" did not convert to "${result}". Got "${expressUrl}" instead.`);
        }
    });
});
