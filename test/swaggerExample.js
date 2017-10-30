"use strict";
const _ = require('lodash');
const express = require('express');
const createRouter = require('../lib/createRouter');
const app = express();

describe('swagger', function() {

    it('can create swagger spec', function() {

        /**
         * The base spec.
         */
        const spec = {
            openapi: '3.0.0',
            info: {
                title: 'Swagger Example',
                version: '1.0'
            },
            components: {},
            paths: {}
        };

        /**
         * We want to use the route definitions to build up the swagger spec.
         */
        const mapActionToHandler = (action, routeDescription, routeOptions) => {

            if (routeOptions.name === 'swagger') { // ignore the route that serves the swagger JSON.
                return action;
            }

            const { name, meta } = routeDescription;
            const { summary, requestSchema, payloadSchema } = meta;

            /**
             * We want to get all the possible request parameter schemas.
             */
            const queryParams = _.get(requestSchema, 'properties.query.properties', {});
            const pathParams = _.get(requestSchema, 'properties.params.properties', {});
            const bodySchema = _.get(requestSchema, 'properties.body');

            /**
             * Each route definition will correspond to a specific operation.
             */
            const operation = {
                operationId: name,
                summary: summary,
                parameters: [],
                responses: {
                    '200': {
                        description: _.get(payloadSchema, 'title', ''),
                        content: {
                            'application/json': {
                                schema: payloadSchema
                            }
                        }
                    }
                }
            };

            _.forEach(Object.keys(queryParams), (param) => {

                operation.parameters.push({
                    in: 'query',
                    name: param,
                    required: _.get(requestSchema, 'properties.query.required', []).indexOf(param) !== -1,
                    schema: queryParams[param]
                });
            });

            _.forEach(Object.keys(pathParams), (param) => {

                operation.parameters.push({
                    in: 'path',
                    name: param,
                    required: _.get(requestSchema, 'properties.params.required', []).indexOf(param) !== -1,
                    schema: pathParams[param]
                });
            });

            if (bodySchema) {
                _.set(operation, 'requestBody', {
                    content: {
                        'application/json': {
                            schema: bodySchema
                        }
                    }
                });
            }

            /**
             * Add the operation to the swagger spec.
             */
            _.set(spec, ['paths', routeDescription.uri, routeOptions.method], operation);

            return (req, res) => {

                // TODO: validate req against requestSchema

                action(req, res);
            };
        };

        /**
         * Create the router with the custom mapActionToHandler function.
         */
        const router = createRouter(app, mapActionToHandler);

        /**
         * Define our schemas.
         */
        const createUserRequestSchema = {
            type: 'object',
            properties: {
                body: {
                    type: 'object',
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email'
                        },
                        password: {
                            type: 'string',
                            minLength: 6
                        }
                    },
                    required: ['email', 'password']
                }
            },
            required: ['body']
        };

        const getUserSchema = {
            type: 'object',
            properties: {
                params: {
                    type: 'object',
                    properties: {
                        userId: {
                            type: 'string'
                        }
                    },
                    required: ['userId']
                }
            },
            required: ['params']
        };

        const userSchema = {
            title: 'User',
            type: 'object',
            properties: {
                id: {
                    type: 'string'
                },
                email: {
                    type: 'string',
                    format: 'email'
                }
            }
        };


        /**
         * Define our routes.
         */
        router.group({ prefix: '/api', namespace: 'api.' }, (router) => {

            router.group({ prefix: '/v1', namespace: 'v1.' }, (router) => {

                router.group({ prefix: '/users', namespace: 'users' }, (router) => {

                    router.post({
                        uri: '/',
                        name: 'createUser',
                        meta: {
                            summary: 'Creates a new user',
                            requestSchema: createUserRequestSchema,
                            payloadSchema: userSchema
                        }
                    }, (req, res) => {

                    });

                    router.get({
                        uri: '/{userId}',
                        name: 'getUser',
                        meta: {
                            summary: 'Gets a user',
                            requestSchema: getUserSchema,
                            payloadSchema: userSchema
                        }
                    }, (req, res) => {

                    });
                });

                /**
                 * Serve the swagger json as well.
                 */
                router.get({ name: 'swagger' }, (req, res) => {

                    res.send(spec);
                });
            });
        });
    });
});