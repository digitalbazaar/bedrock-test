/*!
 * Copyright (c) 2016-2020 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const bedrock = require('bedrock');
const {config} = bedrock;
const fs = require('fs');
const logger = require('./logger');
const path = require('path');

require('./config');

const api = {};
module.exports = api;

api.helpers = require('./helpers');
api.test = require('./test');

bedrock.events.on('bedrock-cli.test.configure', command => {
  command.option(
    '--test-config <files>',
    'A set of comma-delimited config filenames.'
  );
});

bedrock.events.on('bedrock.test.configure', () => {
  // reinitialize protractor suite object
  if(config.protractor) {
    config.protractor.config.suites = {};
  }
  // reinitialize mocha test array
  config.mocha.tests = [];
  const command = bedrock.config.cli.command;
  if(command.testConfig) {
    command.testConfig.split(',')
      .forEach(c => require(path.join(process.cwd(), c)));
  } else {
    try {
      require(path.join(process.cwd(), 'test.config'));
    } catch(e) {
      if(e.message.startsWith('Cannot find module')) {
        return logger.warning('Test configuration `test.config.js` not found.');
      }
      throw e;
    }
  }
});

api.require = module => {
  const parentName = require('../../../../package.json').name;
  // look into the symlinked parent module path for target module
  const modulePath = path.join(
    process.cwd(), 'node_modules', parentName, 'node_modules', module);
  try {
    fs.statSync(modulePath);
  } catch(e) {
    // stat failed
    // target module was not found installed under parent module, load normally
    return require(module);
  }
  // target found under parent module, load the module from the same path
  return require(modulePath);
};
