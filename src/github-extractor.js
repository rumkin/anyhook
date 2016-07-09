module.exports = function(payload) {
    const result = {};
    if ('ref' in payload === false) {
        return;
    }

    if ('commits' in payload === false) {
        return;
    }

    result.branch = payload.ref.slice(payload.ref.lastIndexOf('/') + 1);
    result.repo = payload.repository.full_name;
    result.url = payload.repository.url + '.git';

    return result;
};
