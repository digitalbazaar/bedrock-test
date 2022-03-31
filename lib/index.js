/*!
 * Copyright (c) 2016-2022 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import {createRequire} from 'module';
import fs from 'fs';
import {logger} from './logger.js';
import path from 'path';

const {config} = bedrock;
const cjsRequire = createRequire(import.meta.url);

import './config.js';

export * as test from './test.js';

bedrock.events.on('bedrock-cli.test.configure', command => {
  command.option(
    '--test-config <files>',
    'A set of comma-delimited config filenames.'
  );
});

bedrock.events.on('bedrock.test.configure', async () => {
  // reinitialize protractor suite object
  if(config.protractor) {
    config.protractor.config.suites = {};
  }
  // reinitialize mocha test array
  config.mocha.tests = [];
  const command = bedrock.config.cli.command;
  if(command.testConfig) {
    await Promise.all(command.testConfig.split(',')
      .map(async c => import(path.join(process.cwd(), c))));
  } else {
    try {
      await import(path.join(process.cwd(), 'test.config.js'));
    } catch(e) {
      if(e.message.startsWith('Cannot find module')) {
        return logger.warning('Test configuration `test.config.js` not found.');
      }
      throw e;
    }
  }
});
