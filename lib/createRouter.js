"use strict";
const path = require('path');
const defaultGroupOptions = {
    prefix: '/',
    middleware: [],
    name: '',
    constraints: {},
    meta: {}
};
const defaultRouteOptions = {
    method: 'get',
    uri: '/',
    middleware: [],
    name: '',
    constraints: {},
    meta: {}
};


function laravelToExpress(uri = '', constraints = {}) {

    return uri;
}

function createRouter(app, mapActionToHandler = (action) => action) {

    const namedUrls = {};

    class Router {

        constructor() {

            this.uris = [];
            this.middlewares = [];
            this.names = [];
            this.constraints = [];
            this.metas = [];
        }

        group(options, closure) {

            const groupOptions = Object.assign({}, defaultGroupOptions, options);
            const router = new this.constructor(this);
            router.uris = this.uris.concat(groupOptions.prefix);
            router.middlewares = this.middlewares.concat(groupOptions.middleware);
            router.names = this.names.concat(groupOptions.name);
            router.constraints = this.constraints.concat(groupOptions.constraints);
            router.metas = this.metas.concat(groupOptions.meta);
            closure(router);
        }

        route(options, action) {

            const routeOptions = Object.assign({}, defaultRouteOptions, options);
            routeOptions.method = routeOptions.method.toLowerCase();

            const uri = path.join.apply(null, this.uris.concat(routeOptions.uri));
            const middleware = this.middlewares.concat(routeOptions.middleware);
            const name = this.names.concat(routeOptions.name).join('');
            const constraints = Object.assign.apply(null, [{}].concat(this.constraints, routeOptions.constraints));
            const meta = Object.assign.apply(null, [{}].concat(this.metas, routeOptions.meta));

            const stack = middleware.concat(mapActionToHandler(action, {
                uri,
                middleware,
                name,
                constraints,
                meta
            }, routeOptions));

            if (routeOptions.name) {
                namedUrls[name] = {
                    uri,
                    constraints
                };
            }

            app[routeOptions.method](laravelToExpress(uri, constraints), stack);
        }

        serve(uri, staticMiddleware) {

            const uri = path.join.apply(null, this.uris.concat(uri));

            app.use(laravelToExpress(uri, this.constraints), this.middlewares.concat(staticMiddleware));
        }

        url(name, params = {}) {

        }

    }

    const router = new Router();

    if (!Proxy) {
        return router;
    }


    return new Proxy(router, {
        get: function(router, method) {
            return method in router ?
                router[method] :
                (options, action) => {
                    options.method = method;
                    router.route(options, action);
                };
        }
    });
}

module.exports = createRouter;