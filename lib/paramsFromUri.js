"use strict";

/**
 * @param {string} uri
 * @returns {{optional: Array, required: Array}}
 */
function paramsFromUri(uri = '') {

    const params = {
        optional: [],
        required: []
    };

    let parsingParam = false;
    let currentParam = '';
    let optional = false;

    for (const character of uri) {

        switch (character) {
            case '{':
                parsingParam = true;
                optional = false;
                break;
            case '}':
                params[optional ? 'optional' : 'required'].push(currentParam);
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
                break;
        }
    }

    return params;
}

module.exports = paramsFromUri;