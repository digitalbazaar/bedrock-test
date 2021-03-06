/*!
 * Copyright (c) 2012-2020 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {config} = require('bedrock');
const path = require('path');

// logging
config.loggers.app.filename = '/tmp/bedrock-test-app.log';
config.loggers.access.filename = '/tmp/bedrock-test-access.log';
config.loggers.error.filename = '/tmp/bedrock-test-error.log';
config.loggers.email.silent = true;

// only log critical errors by default
config.loggers.console.level = 'critical';

// test config
config.test = {};
// list of available test frameworks
config.test.frameworks = ['mocha'];

// default mocha config
config.mocha = {};
config.mocha.options = {
  ignoreLeaks: false,
  reporter: 'spec',
  timeout: 15000,
  color: true
};
config.mocha.tests = [];

// built-in tests
config.mocha.tests.push(path.join(__dirname, '..', 'tests'));
