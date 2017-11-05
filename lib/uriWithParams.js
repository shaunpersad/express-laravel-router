"use strict";
const qs = require('qs');
const removeLastCharacter = require('./removeLastCharacter');
/**
 *
 * @param {string} uri
 * @param {{}} [params]
 * @param {{}} [patterns]
 * @param {{}} [options]
 * @returns {string}
 */
function uriWithParams(uri = '', params = {}, patterns = {}, options = {}) {

    params = Object.assign({}, params);

    let parsingParam = false;
    let currentParam = '';
    let newUri = '';
    let optional = false;

    for (const character of uri) {

        switch(character) {
            case '{':
                parsingParam = true;
                optional = false;
                break;
            case '}':
                if (params[currentParam] === undefined && !optional) {
                    throw new Error(`There is no value for the non-optional param "${currentParam}".`)
                }
                if (patterns[currentParam] && !patterns[currentParam].test(params[currentParam])) {

                    throw new Error(`The value "${params[currentParam]}" for the param "${currentParam}" fails the "${patterns[currentParam]}" constraint.`)
                }
                if (params[currentParam] !== undefined) {
                    newUri+= encodeURI(params[currentParam]);
                }
                params[currentParam] = undefined;
                parsingParam = false;
                currentParam = '';
                break;
            case '?':
                optional = true;
                break;
            default:
                if (parsingParam) {
                    currentParam+= character;
                } else {
                    newUri+= character;
                }
                break;
        }
    }

    if (newUri.length > 1 && newUri.charAt(newUri.length - 1) === '/') {
        newUri = removeLastCharacter(newUri);
    }

    options.addQueryPrefix = true;
    const queryString = qs.stringify(params, options);
    if (queryString.length) {
        newUri+= queryString;
    }

    return newUri;
}

module.exports = uriWithParams;