const express = require('express');
const {inspect} = require('util');
const trigger = require('./trigger.js');

module.exports = function(options = {}) {
    var bindings = options.bindings;
    var {debug, verbose} = options;

    var router = express.Router();

    router.all('/:repo', (req, res, next) => {
        const repo = req.params.repo;

        if (repo in bindings === false) {
            next();
            return;
        }

        if (verbose) {
            console.log(new Date(), repo);
        }

        var repoBindings = bindings[repo];
        if (! Array.isArray(repoBindings)) {
            repoBindings = [repoBindings];
        }

        res.end();

        Promise.all(repoBindings.map(
            (binding) => trigger(binding)
            .then(() => {
                return {binding, result: true};
            }, (error) => {
                return {binding, result: false, error};
            })
        ))
        .then((reports) => {
            var hasError = false;
            reports.forEach((report, i) => {
                if (report.result) {
                    return;
                }

                hasError = true;

                console.error('Binding %s:%s error:', repo, i, report.error.message);
            });

            if (verbose) {
                console.log('Repository %s %s', repo, hasError ? 'ERROR' : 'OK');
            }
        });

        res.end('ok');
    });

    return router;
};
