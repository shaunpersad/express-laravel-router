"use strict";

function removeFirstCharacter(str) {

    return str.slice(1);
}

function removeLastCharacter(str) {

    return str.slice(0, str.length - 1);
}

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