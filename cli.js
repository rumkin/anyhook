const express = require('express');
const bodyParser = require('body-parser');
const middleware = require('./');
const argentum = require('argentum');
const path = require('path');
const fs = require('fs');

const CONFIG_PATH = '/etc/githook.json';

const argv = process.argv.slice(2);
const config = argentum.parse(argv, {
    aliases: {
        v: 'verbose',
        d: 'debug',
        f: 'hooks',
        D: 'dir',
        H: 'host',
        p: 'port',
        c: 'config',
    },
    defaults: {
        host: '0.0.0.0',
        port: process.env.PORT || 8080,
        debug: !!process.env.DEBUG || false,
        hooks: process.cwd() + '/hook.json',
        verbose: !!process.env.VERBOSE,
    },
});

const DEBUG = config.debug;
const VERBOSE = config.verbose;

if ('config' in config) {
    appendConfig(config, path.resolve(process.cwd() + config.config));
}

if (fs.existsSync(CONFIG_PATH)) {
    appendConfig(config, CONFIG_PATH);
}

if (! fs.existsSync(config.hooks)) {
    onError('Hooks file not found');
}

express()
.use('/api/hook/', middleware({
    verbose: config.verbose,
    debug: config.debug,
    bindings: require(config.hooks),
}))
.listen(config.port, config.host, () => {
    if (VERBOSE) {
        console.log('Server started at %s:%s', config.host, config.port);
    }
})
;

function appendConfig(config, path) {
    const values = require(path);

    Object.getOwnPropertyNames(values)
    .forEach((key) => {
        if (config.hasOwnProperty(key)) {
            return;
        }

        config[key] = values[key];
    });
}

process.on('uncaughtException', onError);

function onError(error) {
    var msg;
    if (error instanceof Error) {
        if (DEBUG) {
            msg = error.stack;
        } else {
            msg = error.message;
        }
    } else {
        msg = error;
    }

    console.error(msg);
    process.exit(1);
}
