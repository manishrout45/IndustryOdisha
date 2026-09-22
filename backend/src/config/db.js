/**
 * Backward-compatible entry point.
 * Prefer: require('./database') or require('./mongo') / require('./mysql').
 */
module.exports = require('./database');
