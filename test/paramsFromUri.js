"use strict";
const paramsFromUri = require('../lib/paramsFromUri');

describe('paramsFromUri', function() {

    it('should parse out all params from the uri', function() {


        const uri = '/users/{userId}/friends/{friendId}/{username?}';
        const params = paramsFromUri(uri);

        if (
            params.required.length !== 2 ||
            params.required[0] !== 'userId'||
            params.required[1] !== 'friendId' ||
            params.optional.length !== 1 ||
            params.optional[0] !== 'username'
        ) {
            throw new Error();
        }

    });

});