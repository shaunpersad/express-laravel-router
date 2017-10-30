# express-laravel-router
A Laravel-inspired router for express.js

## Motivation
This router is an alternative to the one that ships with express.js. Instead of manually creating instances of `express.Router`,
you can define your routes in group closures, where it becomes easier to create and reason about the shared properties of your routes.

Also, this router allows you to execute custom code for each route definition, which can be useful for many things,
e.g. injecting dependencies into each request handler, or automatically creating a swagger/openapi spec from your routes.

There are also some extra features like being able to name and generate urls strings for each route.

To summarize:
- Easily create and organize route groups
- Execute custom code for each route definition
- Generate urls for a given route definition

## Quickstart
```js
const express = require('express');
const createRouter = require('express-laravel-router').createRouter;

const app = express();
const router = createRouter(app);

router.group('/api', (router) => {
   
    router.group('/v1', (router) => {
                
        router.group('/users', (router) => {
           
            router.get('/{userId}', (req, res) => { /* request handler logic */ });    
        });
        
        router.post('/auth', (req, res) => { /* request handler logic */ });
    });
});
```
The above will create two routes:
1. A GET to `/api/v1/users/{userId}`
2. A POST to `/api/v1/auth`

To create the above example in pure express.js, it would look something like the following:
```js
const express = require('express');

const app = express();
const apiRouter = express.Router();
const v1Router = express.Router();
const usersRouter = express.Router();

usersRouter.get('/:userId', (req, res) => { /* request handler logic */ });

v1Router.use('/users', usersRouter);
v1Router.get('/auth', (req, res) => { /* request handler logic */ });

apiRouter.use('/v1', v1Router);

app.use('/api', apiRouter);
```
The pure express.js version is not only visually harder to reason about, but it becomes increasingly more complex as more
routes and middleware are added.

## Usage
Our quickstart example used strings as the first argument for both the `router.group` and `router.route` methods. You are 
also able to supply an `options` object instead, for more powerful functionality. Supplying just a string is actually a 
shortcut to setting the `prefix` option in the group `options` object, and the `uri` option in the route `options` object. 

### Group options
The full group `options` object with their default values looks like this:
```json
{
    "prefix": "/",
    "middleware": [],
    "namespace": "",
    "patterns": {},
    "meta": {}
}
```
Note that all fields are optional, and any combination of fields can be used.

##### `prefix`
A string that is the common uri to shared with all routes in this group.
```js
router.group({ prefix: '/api' }, (router) => {
    // all routes defined in here will have their uris prefixed by /api.
});
```
Note that the above example is functionally equivalent to the `/api` group in the quickstart example.

##### `middleware`
An array of middleware shared with all routes in this group.
```js
router.group({ 
    middleware: [
        (req, res, next) => {
            next();
        },
        (req, res, next) => {
            next();
        }
    ]
}, (router) => {
    // all routes defined in here will inherit the above middleware.
});
```

##### `namespace`
A string that will be prefixed to any named routes in this group.
```js
router.group({ 
    namespace: 'api.'
}, (router) => {

    router.get({ uri: '/users', name: 'getUsers' }, (req, res) => {
        // this route can generate a url by supplying "api.getUsers" to the router.url() function.
    });
});
```
Note that route names can be useful for other purposes, such as defining the operationIds in swagger/openapi specs.

##### `patterns`
An object whose key=>value pairs are actually route params => regex patterns. Routes using these route params will only
be matched if the param successfully matches its regex pattern.
```js
router.group({ 
    prefix: '/users',
    patterns: {
        userId: /^\d+$/
    }
}, (router) => {

    router.get('/{userId}', (req, res) => {
        // this route will only be matched if userId is a number.
    });
});
```

##### `meta`
An object that can contain arbitrary custom data. This is useful if you wish to associate some data with each route
definition outside of the common options provided above.
```js
const mapActionToHandler = (action, routeDescription, routeOptions) => {
    // routeDescription.meta will contain {foo: 'bar', baz: 'qux'};
    // routeOptions.meta will contain {baz: 'qux'}
    return action;
};

const router = createRouter(app, mapActionToHandler);

router.group({ 
    prefix: '/api',
    meta: {
        foo: 'bar'
    },
}, (router) => {

    router.get({
        uri: '/users',
        meta: {
            baz: 'qux'
        }
    }, (req, res) => {

    });
});
```