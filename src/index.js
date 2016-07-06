const express = require('express');
const {inspect} = require('util');

module.exports = function(options = {}) {
    var repo = options.repo;

    var router = express.Router();

    router.all('/', (req, res, next) => {
        console.log(inspect(req.body, {colors: true, depth: 10}));
        res.end('ok');
    });

    return router;
};
