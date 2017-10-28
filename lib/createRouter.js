"use strict";
const path = require('path');
const defaultOptions = { prefix: '/', middleware: [], name: ''};

function laravelToExpress(uri = '', constraints = {}) {

    return uri;
}

function createRouter(app, routeDescriptionHandler = ({action}) => action) {

    const namedUrls = {};
    const routeDescriptions = [];
    let isComplete = false;

    class RouteDescription {

        constructor(options, method, uri, action) {

            this.options = options;
            this.fullUri = path.join(options.prefix, uri);
            this.method = method;
            this.uri = uri;
            this.action = action;
            this.constraints = {};
        }
        withName(name = '') {

            this.name = name;
            this.fullName = `${this.options.name}${name}`;
            namedUrls[this.fullName] = this.fullUri;
            return this;
        }
        withConstraints(constraints = {}) {

            Object.assign(this.constraints, constraints);
            return this;
        }
    }

    class LaravelRouterRouter {

        constructor(options = defaultOptions) {
            this.options = options;
        }

        group(options = defaultOptions, closure) {

            const groupOptions = Object.assign({}, defaultOptions, options);

            const router = new this.constructor({
                prefix: path.join(this.options.prefix, groupOptions.prefix),
                middleware: this.options.middleware.concat(groupOptions.middleware),
                name: `${this.options.name}${groupOptions.name}`
            });

            closure(router);
        }

        route(method, uri, action) {

            const routeDescription = new RouteDescription(this.options, method, uri, action);
            routeDescriptions.push(routeDescription);

            return routeDescription;
        }

        serve(uri, staticMiddleware) {

            app.use(path.join(this.options.prefix, uri), this.options.middleware.concat(staticMiddleware));
        }

        url(name, params = {}) {

        }

        complete() {

            if (isComplete) {
                throw new Error('"complete" was already called.');
            }

            routeDescriptions.forEach(routeDescription => {

                const stack = routeDescription.options.middleware.concat(routeDescriptionHandler(routeDescription));

                app[routeDescription.method](laravelToExpress(routeDescription.fullUri, routeDescription.constraints), stack);
            });

            isComplete = true;
        }
    }

    return new Proxy(new LaravelRouterRouter(), {
        get: function(router, name) {
            return name in router ?
                router[name] :
                (uri, action) => {
                    router.route(name, uri, action);
                };
        }
    });
}

module.exports = createRouter;