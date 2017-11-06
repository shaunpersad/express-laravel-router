"use strict";

/**
 *
 * @param {string} str
 * @returns {string}
 */
function removeLastCharacter(str) {

    return str.slice(0, str.length - 1);
}

module.exports = removeLastCharacter;
