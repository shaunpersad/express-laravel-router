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
Our quickstart example used strings as the first argument for both the `router.group` and `router.get` methods. You are 
also able to supply an `options` object instead, for more powerful functionality. Supplying just a string is actually a 
shortcut to setting the `prefix` option in the group `options` object, and the `uri` option in the route `options` object. 

### Group options
The full group `options` object with their default values looks like this:
```js
{
    "prefix": "/", // url prefix shared by all routes in this group
    "middleware": [], // middleware shared by all routes in this group
    "namespace": "", // namespace shared by all named routes in this group
    "patterns": {}, // regex patterns shared by all route params in this group
    "meta": {} // additional meta data to associate to all routes in this group
}
```
Note that all fields are optional, and any combination of fields can be used.

Also note that the following are all equivalent:
```js
router.group({ prefix: '/api' }, (router) => {
   
});

// shortcut to the above
router.group('/api', (router) => {
   
});
```
For more details, see the [wiki page](https://github.com/shaunpersad/express-laravel-router/wiki/Group-options).

### Route options
The full route `options` object with their default values looks like this:
```js
{
    "method": "get", // the HTTP method for this route definition
    "uri": "/", // the url fragment for this route definition
    "middleware": [], // the middleware specific to this route definition
    "name": "", // a name to associate to this route definition
    "patterns": {}, // any patterns specific to this route definition
    "meta": {} // any additional meta data to associate to this route definition
}
```
Note that all fields are optional, and any combination of fields can be used.

Also note that the following are all equivalent:
```js
router.route({ method: 'get', uri: '/api' }, (req, res) => {
   
});

// the default method is "get"
router.route({ uri: '/api' }, (req, res) => {
   
});

// using router.{method} prefills the options object with the correct method.
router.get({ uri: '/api' }, (req, res) => {
    
});

// shortcut to the above
router.get('/api', (req, res) => {
   
});
```
For more details, see the [wiki page](https://github.com/shaunpersad/express-laravel-router/wiki/Route-options).

## Full API
Below are all the methods available on a `router`.

##### `router.group(options|prefix, closure)`
Creates a route group and provides a new `router` instance inside the `closure` to perform additional routing inside that group.

##### `router.route(options|uri, action)`
Creates a route definition and associates an `action` with it. The `action` is then passed to a `mapActionToHandler`
function, whose job it is to return the familiar express.js requestHandler function, whose signature is:
```js
(req, res) => {}
```
The default `mapActionToHandler` function assumes that the `action` passed to `router.route` is already an express.js
requestHandler function. This behavior can be changed by supplying a new `mapActionToHandler` function to `createRouter`:
```js
const mapActionToHandler = (action, routeDescription, routeOptions) => {

    return action.customHandler;
};

const router = createRouter(app, mapActionToHandler);

router.route('/users', { customHandler: (req, res) => {} });
```
The above example now expects that the `action` is an object with a `customHandler` property.

##### `router.{method}(options|uri, action)`
Instead of supplying a `method` in the options of `router.route`, you can simply call `router.{method}`, which will
set the proper `method` field in the options.
```js
router.route({ method: 'post', uri: '/create' }, (req, res) => {
    
});

// shortcut to the above
router.post('/create', (req, res) => {
   
});
```

##### `router.serve(uri, staticMiddleware)`
Creates a route that serves static files.
```js
router.serve('/assets', express.static('./public/assets'));
```

##### `router.url(name[, params])`
Creates and returns a url for the route definition with the given name. If that route contains params, you can pass in
values to fill in the params in the optional `params` object. Any extra fields found in the `params` object but not found
in the route definition will be considered query params, and will be appended to the url as a query string.

If there are any patterns on the params, they must be honored by the supplied params, or an error will be thrown.
```js
router.group({ prefix: '/user/{userId}', namespace: 'user.' }, (router) => {
   
    router.get({ uri: '/friend/{friendId}', name: 'getFriend' }, (req, res) => {
        
    });
});

const url = router.url('user.getFriend', { userId: 1, friendId: 2, foo: 'bar' });
// url will equal /user/1/friend/2?foo=bar
```
```js
router.get({ 
    uri: '/user/{userId}', 
    name: 'getUser', 
    patterns: { 
        userId: /^\d+$/ 
    } 
}, (req, res) => {
    
});
const url = router.url('getUser', { userId: "one"}); // this will throw an error, because userId is expected to be a number.
```

## Differences to Laravel
Unlike Laravel routes, chaining is discarded in favor of objects containing options. I found this to be a much clearer API.

Additionally, some of Laravel's naming has been updated or repurposed for clarity, e.g. Laravel's "as" has become "name"
in route definitions, and "namespace" in route groups.