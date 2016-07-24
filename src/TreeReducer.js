function isArray (val) {
    return Object.prototype.toString.call(val) === '[object Array]';
}

function TreeReducer (root) {
    this.queue = [];
    this.add(root);
}

TreeReducer.prototype.add = function (node) {
    if (typeof node === 'undefined') return;

    if (isArray(node)) {
        Array.prototype.push.apply(this.queue, node);
    } else {
        Array.prototype.push.call(this.queue, node);
    }
};

TreeReducer.prototype.reduce = function(fn, memo) {
    var queue = this.queue,
        node;

    while (queue.length !== 0) {
        node = queue.shift();
        memo = fn.call(this, memo, node);
    }

    return memo;
};

module.exports = TreeReducer;