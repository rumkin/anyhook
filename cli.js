const express = require('express');
const bodyParser = require('body-parser');
const middleware = require('./');
const path = require('path');
const fs = require('fs');
const program = require('commander');

const CONFIG_PATH = process.env.NODE_ENV !== 'development' ? '/etc/githook.json' : null;

program
    .version('1.0.0')
    .description('Modular web hook capturing util')
    .option('-v,--verbose', 'Verbose output')
    .option('-d,--debug', 'Debug application')
    .option('-c,--config <path>', 'config path')
    ;

program
    .command('start [dir]')
    .option('-H,--host <host>', 'Host name')
    .option('-p,--port <port>', 'Port')
    .action((dir, cmd) => {
        const config = loadConfig({
            host: cmd.host || process.env.HOST || 'localhost',
            port: cmd.port || process.env.PORT || '1972',
            verbose: cmd.parent.verbose || false,
            debug: cmd.parent.debug || false,
            dir: dir || process.cwd(),
        }, configPaths(cmd.parent.config, CONFIG_PATH));

        config.hooks = loadHooks(config.dir);

        startServer(config);
    });

program
    .command('help', {isdefault: true})
    .action(() => {
        program.outputHelp();
    });

program.parse(process.argv);

function configPaths(...paths) {
    return paths.filter((p) => !!p)
    .map((p) => {
        return path.resolve(p);
    });
}

function loadConfig(config, paths) {
    paths.forEach((p) => {
        if (! fs.existsSync(p)) {
            throw new Error(`Config "${p}" not found`);
        }

        appendConfig(config, p);
    });

    return config;
}

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

function loadHooks(dir) {
    let hooks = {};

    if (! fs.existsSync(dir) || ! fs.statSync(dir).isDirectory()) {
        throw new Error(`Hook directory "${dir}" is not readable`);
    }

    fs.readdirSync(dir).forEach((file) => {
        let p = path.parse(file);
        if (p.ext !== '.json') {
            return;
        }

        let filepath = path.join(dir, file);

        if (! fs.statSync(filepath).isFile()) {
            return;
        }

        hooks[p.name] = require(filepath);
    });

    return hooks;
}

function startServer(config) {
    const VERBOSE = config.verbose;

    express()
    .use(bodyParser.json())
    .use('/api/webhook/', middleware({
        verbose: config.verbose,
        debug: config.debug,
        bindings: config.hooks,
        platforms: [
            require('./src/github-extractor.js'),
            require('./src/bitbucket-extractor.js'),
        ],
    }))
    .listen(config.port, config.host, () => {
        if (VERBOSE) {
            console.log('Server started at %s:%s', config.host, config.port);
        }
    })
    ;
}

process.on('uncaughtException', onError);

function onError(error) {
    var msg;
    if (error instanceof Error) {
        msg = error.message + error.stack;
    } else {
        msg = error;
    }

    console.error(msg);
    process.exit(1);
}
