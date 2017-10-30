"use strict";
const express = require('express');
const supertest = require('supertest');

const createRouter = require('../lib/createRouter');

const methods = [
    'checkout',
    'copy',
    'delete',
    'get',
    'head',
    'lock',
    'merge',
    'mkactivity',
    'mkcol',
    'move',
    'm-search',
    'notify',
    'options',
    'patch',
    'post',
    'purge',
    'put',
    'report',
    'search',
    'subscribe',
    'trace',
    'unlock',
    'unsubscribe'
];

let app;
let router;

beforeEach(function() {
    app = express();
    router = createRouter(app);
});

describe('createRouter(app:express[, mapActionToHandler:function]):Router', function() {

    describe('created Router instance', function() {

        describe('router.route(options:object|string, action:*):void', function() {

            describe('basic functionality', function() {

                const tests = [
                    {
                        description: '"options" is a string to the root',
                        options: '/',
                        action(req, res) {

                            res.send('OK');
                        },
                        expected: [
                            {
                                url: '/',
                                method: 'get',
                                status: 200,
                                response: 'OK'
                            },
                            {
                                url: '/',
                                method: 'post',
                                status: 404
                            },
                            {
                                url: '/foo',
                                method: 'get',
                                status: 404,
                            }
                        ]
                    },
                    {
                        description: '"options" is a simple uri string',
                        options: '/foo',
                        action(req, res) {

                            res.send('OK');
                        },
                        expected: [
                            {
                                url: '/foo',
                                method: 'get',
                                status: 200,
                                response: 'OK'
                            },
                            {
                                url: '/foo/',
                                method: 'get',
                                status: 200,
                                response: 'OK'
                            },
                            {
                                url: '/foo',
                                method: 'post',
                                status: 404
                            },
                            {
                                url: '/',
                                method: 'get',
                                status: 404
                            }
                        ]
                    },
                    {
                        description: '"options" is a uri string includes a simple param',
                        options: '/foo/{bar}',
                        action(req, res) {

                            res.send(req.params.bar);
                        },
                        expected: [
                            {
                                url: '/foo/thing',
                                method: 'get',
                                status: 200,
                                response: 'thing'
                            },
                            {
                                url: '/foo',
                                method: 'get',
                                status: 404
                            },
                            {
                                url: '/foo/',
                                method: 'get',
                                status: 404
                            },
                        ]
                    },
                    {
                        description: '"options" is a uri string includes simple consecutive params',
                        options: '/foo/{bar}/{baz}',
                        action(req, res) {

                            res.send(`${req.params.bar}-${req.params.baz}`);
                        },
                        expected: [
                            {
                                url: '/foo/thing/other',
                                method: 'get',
                                status: 200,
                                response: 'thing-other'
                            },
                            {
                                url: '/foo/thing',
                                method: 'get',
                                status: 404
                            },
                            {
                                url: '/foo/other',
                                method: 'get',
                                status: 404
                            },
                        ]
                    },
                    ,
                    {
                        description: '"options" is a uri string includes many simple params',
                        options: '/foo/{bar}/baz/{qux}',
                        action(req, res) {

                            res.send(`${req.params.bar}-${req.params.qux}`);
                        },
                        expected: [
                            {
                                url: '/foo/thing/baz/other',
                                method: 'get',
                                status: 200,
                                response: 'thing-other'
                            },
                            {
                                url: '/foo/thing/baz',
                                method: 'get',
                                status: 404
                            }
                        ]
                    },
                    {
                        description: '"options" is a uri string that includes an optional param',
                        options: '/foo/{bar?}',
                        action(req, res) {

                            res.send(req.params.bar || '');
                        },
                        expected: [
                            {
                                url: '/foo/thing',
                                method: 'get',
                                status: 200,
                                response: 'thing'
                            },
                            {
                                url: '/foo',
                                method: 'get',
                                status: 200,
                                response: ''
                            },
                            {
                                url: '/foo/',
                                method: 'get',
                                status: 200,
                                response: ''
                            },

                        ]
                    },
                    {
                        description: '"options" is an object with a uri to the root',
                        options: {
                            uri: '/'
                        },
                        action(req, res) {

                            res.send('OK');
                        },
                        expected: [
                            {
                                url: '/',
                                method: 'get',
                                status: 200,
                                response: 'OK'
                            },
                            {
                                url: '/',
                                method: 'post',
                                status: 404
                            },
                            {
                                url: '/foo',
                                method: 'get',
                                status: 404,
                            }
                        ]
                    },
                    {
                        description: '"options" is an object with a simple uri string',
                        options: {
                            uri: '/foo'
                        },
                        action(req, res) {

                            res.send('OK');
                        },
                        expected: [
                            {
                                url: '/foo',
                                method: 'get',
                                status: 200,
                                response: 'OK'
                            },
                            {
                                url: '/foo/',
                                method: 'get',
                                status: 200,
                                response: 'OK'
                            },
                            {
                                url: '/foo',
                                method: 'post',
                                status: 404
                            },
                            {
                                url: '/',
                                method: 'get',
                                status: 404
                            }
                        ]
                    },
                    {
                        description: '"options" is an object with a param that has a constraint',
                        options: {
                            uri: '/foo/{bar}',
                            patterns: {
                                bar: /^[a-zA-Z]*$/
                            }
                        },
                        action(req, res) {

                            res.send(req.params.bar);
                        },
                        expected: [
                            {
                                url: '/foo/thing',
                                method: 'get',
                                status: 200,
                                response: 'thing'
                            },
                            {
                                url: '/foo/123',
                                method: 'get',
                                status: 404
                            }
                        ]
                    },
                ];

                tests.forEach(test => {

                    describe(test.description, function() {

                        test.expected.forEach(expected => {

                            it(`returns a ${expected.status} for the request ${expected.method} ${expected.url}`, function(done) {

                                router.route(test.options, test.action);

                                const request = supertest(app)[expected.method](expected.url);

                                if (expected.response) {
                                    request.expect(expected.status, expected.response);
                                } else {
                                    request.expect(expected.status);
                                }
                                request.end(done);
                            });
                        });
                    });
                });
            });

            describe('different methods', function() {

                methods.forEach(method => {

                    it(`successfully routes to ${method} requests`, function(done) {

                        const uri = '/foo';

                        router.route({
                            method,
                            uri
                        }, (req, res) => {

                            res.send('OK');
                        });

                        supertest(app)[method](uri).expect(200, done);
                    });

                });
            });

            describe('middleware', function() {

                it('accepts an array of middleware', function(done) {

                    const middleware = [
                        (req, res, next) => {
                            req.cumulative = [];
                            next();
                        },
                        (req, res, next) => {
                            req.cumulative.push('OK');
                            next();
                        }
                    ];

                    router.route({
                        middleware
                    }, (req, res) => {
                        res.send(req.cumulative[0]);
                    });

                    supertest(app).get('/').expect(200, 'OK', done);
                });
            });

            describe('named routes', function() {

                it('allows routes to be named, so that urls can be created later by referencing these names', function(done) {

                    const uri = '/foo';
                    const name = 'bar';

                    router.route({
                        uri,
                        name
                    }, (req, res) => {

                        res.send(router.url(name));
                    });

                    supertest(app).get(uri).expect(200, router.url(name), done);
                });
            });
        });

        describe('router.group(groupOptions:object, closure:function)', function() {

            it('creates route groups that can share common uri prefixes, middleware, namespaces, and patterns', function(done) {

                let mCount = 0;
                let mCountMiddleware = (req, res, next) => {
                    mCount++;
                    next();
                };

                router.group({
                    prefix: '/api',
                    middleware: [
                        mCountMiddleware
                    ],
                    namespace: 'base.'
                }, (router) => {

                    router.group({
                        prefix: 'v{version}',
                        middleware: [
                            mCountMiddleware
                        ],
                        namespace: 'version.',
                        patterns: {
                            version: /^\d+$/
                        }
                    }, (router) => {

                        router.group({
                            prefix: '/users/{user}',
                            namespace: 'users.',
                            patterns: {
                                user: /^\d+$/
                            }
                        }, (router) => {

                            router.route({
                                uri: '/',
                                name: 'getUser' ,
                                middleware: [
                                    mCountMiddleware
                                ]
                            }, (req, res) => {

                                res.send({
                                    mCount
                                });
                            });

                            router.route({
                                uri: '/name',
                                name: 'getName',
                                patterns: {
                                    user: /^\w+$/
                                }
                            }, (req, res) => {

                                res.send(req.params.user);
                            });
                        });
                    });

                });

                const getUserUrl = router.url('base.version.users.getUser', {version: 1, user: 2});
                const getUserUrlResult = '/api/v1/users/2';
                if (getUserUrl !== getUserUrlResult) {

                    throw new Error(`Expected "${getUserUrlResult}", got ${getUserUrl} instead.`);
                }

                const getNameUrl = router.url('base.version.users.getName', {version: 1, user: 'shaunpersad'});
                const getNameUrlResult = '/api/v1/users/shaunpersad/name';
                if (getNameUrl !== getNameUrlResult) {

                    throw new Error(`Expected "${getNameUrlResult}", got ${getNameUrl} instead.`);
                }

                supertest(app).get(getUserUrl).expect(200).end((err, res) => {

                    if (err) {
                        throw err;
                    }
                    if (res.body.mCount !== mCount) {
                        throw new Error('Not all middlewares have been traversed');
                    }

                    supertest(app).get(getNameUrl).expect(200, 'shaunpersad', done);
                });
            });
        });

        describe('router.url(name:string, params:object)', function() {

            it('generates urls to routes that have been named', function() {

                router.group({
                    prefix: '/foo',
                    namespace: 'bar.'
                }, (router) => {

                    router.route({
                        name: 'baz'
                    }, (req, res) => {

                        res.send('OK');
                    });
                });

                router.route({
                    uri: '/',
                    name: 'index'
                }, (req, res) => {

                    res.send('OK');
                });

                const barBaz = router.url('bar.baz');
                const barBazResult = '/foo';

                if (barBaz !== barBazResult) {

                    throw new Error(`Expected "${barBazResult}", got "${barBaz}" instead`);
                }

                const index = router.url('index');
                const indexResult = '/';

                if (index !== indexResult) {

                    throw new Error(`Expected "${indexResult}", got "${index}" instead`);
                }
            });

            it('fills in params with the values supplied', function() {

                router.group({
                    prefix: '/{foo}'
                }, (router) => {

                    router.route({
                        uri: '/{bar}',
                        name: 'baz'
                    }, (req, res) => {

                        res.send('OK');
                    });
                });

                const baz = router.url('baz', {foo: 1, bar: 2});
                const bazResult = '/1/2';

                if (baz !== bazResult) {

                    throw new Error(`Expected "${bazResult}", got "${baz}" instead`);
                }
            });

            it('throws an error if a non-optional param is not supplied', function() {

                router.group({
                    prefix: '/{foo}'
                }, (router) => {

                    router.route({
                        uri: '/{bar}',
                        name: 'baz'
                    }, (req, res) => {

                        res.send('OK');
                    });
                });

                let error = false;
                try {
                    const baz = router.url('baz', {foo: 1});
                } catch(e) {
                   error = true;
                }

                if (!error) {
                    throw new Error('Should have thrown an error.');
                }
            });

            it('will not throw an error if an optional param is not supplied', function() {

                router.group({
                    prefix: '/{foo}'
                }, (router) => {

                    router.route({
                        uri: '/{bar?}',
                        name: 'baz'
                    }, (req, res) => {

                        res.send('OK');
                    });
                });

                const baz = router.url('baz', {foo: 1});

                if (baz !== '/1') {
                    throw new Error(`Expected "/1", got "${baz}" instead`);
                }
            });
        });

        describe('router.{method}', function() {

            describe('different HTTP methods can also be routed to via router.{method} (or router[method])', function() {

                methods.forEach(method => {

                    it(`successfully routes to ${method} requests`, function(done) {

                        const uri = '/foo';

                        router[method](uri, (req, res) => {

                            res.send('OK');
                        });

                        supertest(app)[method](uri).expect(200, done);
                    });

                });

            });
        });
    });

    describe('mapActionToHandler(action:*, routeDescription:object, routeOptions:object)', function() {

        it('is called for each route defined, and must return a request handler', function(done) {

            const router = createRouter(app, (action, routeDescription, routeOptions) => {

                return action.customHandler;
            });

            router.group('/foo', (router) => {

                router.route('/bar', {
                    customHandler: (req, res) => {
                        res.send('BAR');
                    }
                });

                router.route('/baz', {
                    customHandler: (req, res) => {
                        res.send('BAZ');
                    }
                });
            });

            supertest(app).get('/foo/bar').expect(200, 'BAR', (err) => {

                if (err) {
                    throw err;
                }

                supertest(app).get('/foo/baz').expect(200, 'BAZ', done);
            });
        });
    });

});
