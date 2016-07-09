const {inspect} = require('util');
module.exports = function(payload) {
    const result = {};
    if ('push' in payload === false) {
        return;
    }

    var push = payload.push;

    if ('changes' in push === false || !Array.isArray(push.changes)) {
        return;
    }

    result.repo = payload.repository.full_name;
    result.branch = push.changes[0].new.name;
    result.url = payload.repository.links.html.href + '.git';

    return result;
};
