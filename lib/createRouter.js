"use strict";
const path = require('path');

const laravelToExpress = require('./laravelToExpress');
const uriWithParams = require('./uriWithParams');

const defaultGroupOptions = {
    prefix: '/',
    middleware: [],
    namespace: '',
    patterns: {},
    meta: {}
};
const defaultRouteOptions = {
    method: 'get',
    uri: '/',
    middleware: [],
    name: '',
    patterns: {},
    meta: {}
};

const proxy = {
    get: function(router, method) {
        return method in router ?
            router[method] :
            (options, action) => {

                if (typeof options === 'string' || options instanceof String) {
                    options = {
                        uri: options
                    };
                }

                options.method = method;
                router.route(options, action);
            };
    }
};

function createRouter(app, mapActionToHandler = (action) => action) {

    const namedUrls = {};

    class Router {

        constructor() {

            this.app = app;
            this.uris = [];
            this.middlewares = [];
            this.names = [];
            this.patterns = [];
            this.metas = [];
        }

        route(options, action) {

            if (typeof options === 'string' || options instanceof String) {
                options = {
                    uri: options
                };
            }

            const routeOptions = Object.assign({}, defaultRouteOptions, options);
            routeOptions.method = routeOptions.method.toLowerCase();

            const uri = path.join.apply(null, this.uris.concat(`/${routeOptions.uri}`));
            const middleware = this.middlewares.concat(routeOptions.middleware);
            const name = this.names.concat(routeOptions.name).join('');
            const patterns = Object.assign.apply(null, [{}].concat(this.patterns, routeOptions.patterns));
            const meta = Object.assign.apply(null, [{}].concat(this.metas, routeOptions.meta));

            const stack = middleware.concat(mapActionToHandler(action, {
                uri,
                middleware,
                name,
                patterns,
                meta
            }, routeOptions));

            if (routeOptions.name) {
                namedUrls[name] = {
                    uri,
                    patterns
                };
            }

            app[routeOptions.method](laravelToExpress(uri, patterns), stack);
        }

        group(options, closure) {

            if (typeof options === 'string' || options instanceof String) {
                options = {
                    prefix: options
                };
            }

            const groupOptions = Object.assign({}, defaultGroupOptions, options);
            const router = new this.constructor(this);
            router.uris = this.uris.concat(`/${groupOptions.prefix}`);
            router.middlewares = this.middlewares.concat(groupOptions.middleware);
            router.names = this.names.concat(groupOptions.namespace);
            router.patterns = this.patterns.concat(groupOptions.patterns);
            router.metas = this.metas.concat(groupOptions.meta);

            if (!Proxy) {
                return closure(router);
            }

            closure(new Proxy(router, proxy));
        }

        serve(uri, staticMiddleware) {

            const uri = path.join.apply(null, this.uris.concat(uri));
            const patterns = Object.assign.apply(null, [{}].concat(this.patterns));
            const stack = this.middlewares.concat(staticMiddleware);

            app.use(laravelToExpress(uri, patterns), stack);
        }

        url(name, params = {}, options = {}) {

            const namedUrl = namedUrls[name];
            if (!namedUrl) {
                throw new Error(`No URL found for  "${name}"`);
            }
            const { uri, patterns } = namedUrl;

            return uriWithParams(uri, params, patterns, options);
        }

    }

    const router = new Router();

    if (!Proxy) {
        return router;
    }


    return new Proxy(router, proxy);
}

module.exports = createRouter;