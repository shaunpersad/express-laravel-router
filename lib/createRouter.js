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

        /**
         *
         * @param {string|object} options
         * @param {*} action
         * @returns {Router}
         */
        route(options, action) {

            if (typeof options === 'string' || options instanceof String) {
                options = {
                    uri: options
                };
            }

            const routeOptions = Object.assign({}, defaultRouteOptions, options);
            routeOptions.method = routeOptions.method.toLowerCase();

            let uri = path.join.apply(null, this.uris.concat(`/${routeOptions.uri}`));
            let middleware = this.middlewares.concat(routeOptions.middleware);
            let name = this.names.concat(routeOptions.name).join('');
            let patterns = Object.assign.apply(null, [{}].concat(this.patterns, routeOptions.patterns));
            let meta = Object.assign.apply(null, [{}].concat(this.metas, routeOptions.meta));

            let stack = middleware.concat(mapActionToHandler(action, {
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

            uri = uri.replace(/\\+/gmi, '/');

            try {
                app[routeOptions.method](laravelToExpress(uri, patterns), stack);
            } catch (e) {
                // console.error(e);
            }

            return this;
        }

        /**
         *
         * @param {string|object} options
         * @param {function} closure
         * @returns {Router}
         */
        group(options, closure) {

            if (typeof options === 'string' || options instanceof String) {
                options = {
                    prefix: options
                };
            }

            let groupOptions = Object.assign({}, defaultGroupOptions, options);
            let router = new this.constructor(this);
            router.uris = this.uris.concat(`/${groupOptions.prefix}`);
            router.middlewares = this.middlewares.concat(groupOptions.middleware);
            router.names = this.names.concat(groupOptions.namespace);
            router.patterns = this.patterns.concat(groupOptions.patterns);
            router.metas = this.metas.concat(groupOptions.meta);

            if (!Proxy) {
                closure(router);
                return this;
            }

            closure(new Proxy(router, proxy));
            return this;
        }

        /**
         *
         * @param {string} uri
         * @param staticMiddleware
         * @returns {Router}
         */
        serve(uri, staticMiddleware) {

            let uri2 = path.join.apply(null, this.uris.concat(uri));
            let patterns = Object.assign.apply(null, [{}].concat(this.patterns));
            let stack = this.middlewares.concat(staticMiddleware);

            app.use(laravelToExpress(uri2, patterns), stack);
            return this;
        }

        /**
         *
         * @param {string} name
         * @param {object} [params]
         * @param {object} [options]
         * @returns {string}
         */
        url(name, params = {}, options = {}) {

            const namedUrl = namedUrls[name];
            if (!namedUrl) {
                throw new Error(`No URL found for  "${name}"`);
            }
            const {uri, patterns} = namedUrl;

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
