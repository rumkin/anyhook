'use strict';

const express = require('express');
const trigger = require('./trigger.js');
const Extractor = require('./extractor.js');
const chalk = require('chalk');

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

        var repoBindings = normalizeBinding(bindings[repo]);

        if (repoBindings.hasOwnProperty('token')) {
            if (repoBindings.token !== req.query.token) {
                res.status(403).end('Access Forbidden');
                return;
            }
        }

        const data = extractor.extract(req.body);

        if (! data) {
            next();
            return;
        }

        var enabled = true;

        if (repoBindings.enabled === false) {
            enabled = false;
        }

        if (repoBindings.hasOwnProperty('branch') && data.branch !== reportBindings.branch) {
            res.end();
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

        res.end();

        if (! enabled) {
            return;
        }

        repoBindings = repoBindings.exec.map(trigger.normalize)
        .filter(binding => binding.enabled !== false);

        Promise.all(repoBindings.exec.map(
            (binding) => trigger(binding, env)
            .then(() => {
                return {binding, result: true};
            }, (error) => {
                return {binding, result: false, error};
            })
        ))
        .then((reports) => {
            var hasError = false;
            console.log('Repo %s:', repo);

            reports.forEach((report, i) => {
                var {binding, result, error} = report;

                console.log(
                    '\t' + (result ? chalk.green('OK  ') : chalk.red('FAIL')),
                    binding.cmd, binding.args.map(arg => arg.search(/\s/) > -1 ? `"${arg}"` : arg).join(' ')
                );

                if (error) {
                    console.error(chalk.yellow('\t%s'), error.message);
                }
                hasError = true;
            });
        });

        res.end('ok');
    });

    return router;
};

function normalizeBinding(params) {
    if (typeof params === 'string') {
        return {
            enabled: true,
            exec: [params],
        };
    } else if (Array.isArray(params)) {
        return {
            enabled: true,
            exec: params,
        };
    } else {
        return params;
    }
}
