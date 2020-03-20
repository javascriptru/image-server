const app = require('./app');
const { task, series, parallel } = require('gulp');
const nodemon = require('nodemon');

task('server', async function() {
  let port = process.env.PORT || 80;
  let host = process.env.HOST || '0.0.0.0';

  let server = app.listen(port, host, () => {
    console.log(`App is running on ${host}:${port}`);
  });

  await new Promise(res => server.on('close', res));
});


task('nodemon', async function() {
  nodemon({
    ext:      "js",
    verbose:  true,
    delay:    10,
    env:      {
      NODE_ENV: process.env.NODE_ENV || "development"
    },
    args:     ['server'],
    nodeArgs: process.env.DEBUG ? ['--inspect'] : [],
    script:   "./node_modules/.bin/gulp",
    watch:    ["*"],
  });

  await new Promise(resolve => {    });
});
