const express = require('express');
const bodyParser = require('body-parser');
const middleware = require('./');
// const argentum = require('argentum');

const port = process.env.PORT;

express()
.use(bodyParser.json())
.use('/api/githook/', middleware({
    repo: 'bitbucket.org/rumkin/ic',
    dir: '/tmp/directory',
}))
.listen(port, () => console.log('Server started at 0.0.0.0:%s', port))
;
