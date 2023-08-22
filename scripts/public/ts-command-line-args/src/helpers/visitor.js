"use strict";
/* eslint-disable @typescript-eslint/ban-types */
Object.defineProperty(exports, "__esModule", { value: true });
exports.visit = void 0;
/**
 * visits all values in a complex object.
 * allows us to perform trasformations on values
 */
function visit(value, callback) {
    if (Array.isArray(value)) {
        value.forEach((_, index) => visitKey(index, value, callback));
    }
    else {
        Object.keys(value).forEach((key) => visitKey(key, value, callback));
    }
    return value;
}
exports.visit = visit;
function visitKey(key, parent, callback) {
    const keyValue = parent[key];
    parent[key] = callback(keyValue, key, parent);
    if (typeof keyValue === 'object') {
        visit(keyValue, callback);
    }
}
