"use strict";
const removeFirstCharacter = require('./removeFirstCharacter');
const removeLastCharacter = require('./removeLastCharacter');

/**
 *
 * @param {RegExp|string} regex
 * @returns {string}
 */
function trimRegex(regex) {

    let regexString = `${regex}`;

    if (regexString.charAt(0) === '/') {
        regexString = removeFirstCharacter(regexString);
    }
    if (regexString.charAt(0) === '^') {
        regexString = removeFirstCharacter(regexString);
    }
    if (regexString.charAt(regexString.length - 1) === '/') {
        regexString = removeLastCharacter(regexString);
    }
    if (regexString.charAt(regexString.length - 1) === '$') {
        regexString = removeLastCharacter(regexString);
    }

    return regexString;
}

module.exports = trimRegex;