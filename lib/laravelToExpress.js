"use strict";
const trimRegex = require('./trimRegex');

/**
 *
 * @param {string} uri
 * @param {{}} constraints
 * @returns {string}
 */
function laravelToExpress(uri = '', constraints = {}) {

    let parsingParam = false;
    let currentParam = '';
    let newUri = '';
    let optional = false;

    for (const character of uri) {

        switch(character) {
            case '{':
                parsingParam = true;
                optional = false;
                newUri+= ':';
                break;
            case '}':
                if (constraints[currentParam]) {
                    newUri+=`(${trimRegex(constraints[currentParam])})`;
                }
                if (optional) {
                    newUri+='?';
                }
                parsingParam = false;
                currentParam = '';
                break;
            case '?':
                optional = true;
                break;
            default:
                if (parsingParam) {
                    currentParam+= character;
                }
                newUri+= character;
                break;
        }
    }

    return newUri;
}

module.exports = laravelToExpress;
