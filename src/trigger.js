'use strict';

const {spawn, exec} = require('child_process');
const path = require('path');
const fs = require('fs');

module.exports = trigger;

function trigger(call, env) {
    return new Promise((resolve, reject) => {
        var proc;
        if (typeof call === 'string') {
            call = {
                cmd: 'bash',
                args: ['-c', call],
            };
        }

        let stdio = call.stdio;
        let stdout;
        let stderr;

        if (stdio) {
            if (! Array.isArray(stdio)) {
                stdout = stderr = fs.createWriteStream(stdio, {flags: 'a'});
            } else {
                stdout = stdio[0]
                ? fs.createWriteStream(stdio[0], {flags: 'a'})
                : null;

                if (stdio[0] === stdio[1]) {
                    stderr = stdout;
                } else {
                    stderr = stdio[1]
                    ? fs.createWriteStream(stdio[1], {flags: 'a'})
                    : null;
                }
            }
        }

        proc = spawn(call.cmd, call.args, {
            stdio: [
                null,
                stdout ? 'pipe' : 'inherit',
                stderr ? 'pipe' : 'inherit',
            ],
            env: Object.assign({}, call.env, env),
        });

        if (stdout) {
            proc.stdout.pipe(stdout);
        }

        if (stderr) {
            proc.stderr.pipe(stderr);
        }

        proc.once('error', reject);
        proc.once('exit', (code) => {
            if (code) {
                reject(new Error(`Exit code is ${code}.`));
            } else {
                resolve();
            }
        });
    });
}

function normalizeBinding(binding) {
    if (typeof binding !== 'string') {
        return binding;
    }

    return {
        cmd: 'bash',
        args: ['-c', binding],
        enabled: true,
    };
}

trigger.normalize = normalizeBinding;
