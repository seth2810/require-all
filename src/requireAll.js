var fs = require('fs');
var path = require('path');
var TreeReducer = require('./TreeReducer');

var DEFAULT_EXCLUDE_DIR = /^\./;
var DEFAULT_FILTER = /^([^\.].*)\.js(on)?$/;
var DEFAULT_RECURSIVE = true;

function isFunction (val) {
    return Object.prototype.toString.call(val) === '[object Function]';
}

function identity (val) {
    return val;
}

function join (dirname) {
    return function (file) {
        return path.join(dirname, file);
    };
}

function defaultResolve (memo, filePath, key) {
    memo[key] = require(filePath);
}

function requireAll (options) {
    var root = typeof options === 'string' ? options : options.dirname;
    var memo = options.memo || {};
    var filter = options.filter || DEFAULT_FILTER;
    var recursive = options.recursive;
    var map = options.map;
    var resolve = options.resolve;
    var excludeDirs = options.excludeDirs || DEFAULT_EXCLUDE_DIR;
    var reducer = new TreeReducer('.');

    if (typeof recursive === 'undefined') recursive = DEFAULT_RECURSIVE;
    if (!isFunction(resolve)) resolve = defaultResolve;
    if (!isFunction(map)) map = identity;

    return reducer.reduce(function (memo, dirname) {
        var filePath = join(root)(dirname);

        if (fs.statSync(filePath).isDirectory()) {
            if (dirname !== '.') {
                if (!recursive || (excludeDirs && dirname.match(excludeDirs))) {
                    return memo;
                }
            }

            this.add(fs.readdirSync(filePath).map(join(dirname)));
        } else {
            var match = dirname.match(filter);

            if (!match) return memo;

            Array.prototype.splice.call(match, 0, 1);

            resolve.call(null, memo, filePath, map.apply(null, match));
        }

        return memo;
    }, memo);
}

module.exports = requireAll;