const express = require('express');
const {inspect} = require('util');
const trigger = require('./trigger.js');
const Extractor = require('./extractor.js');

module.exports = function(options = {}) {
    var bindings = options.bindings;
    var {debug, verbose} = options;

    var router = express.Router();
    var extractor = new Extractor({extractors: options.platforms || []});

    router.all('/:repo', (req, res, next) => {
        const repo = req.params.repo;

        if (repo in bindings === false) {
            next();
            return;
        }

        console.log(JSON.stringify(req.body, null, 4));

        const data = extractor.extract(req.body);

        if (! data) {
            next();
            return;
        }

        var env = {};

        Object.getOwnPropertyNames(data).forEach((key) => {
            var varname = 'WEBHOOK_' + key.toUpperCase();
            env[varname] = data[key];
        });

        if (verbose) {
            console.log(new Date(), repo);
            console.log(new Date(), env);
        }

        var repoBindings = bindings[repo];
        if (! Array.isArray(repoBindings)) {
            repoBindings = [repoBindings];
        }

        res.end();

        Promise.all(repoBindings.map(
            (binding) => trigger(binding, env)
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
