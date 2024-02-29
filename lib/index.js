/*!
 * Copyright 2016 - 2024 Digital Bazaar, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import * as bedrock from '@bedrock/core';
import {existsSync} from 'node:fs';
import {logger} from './logger.js';
import path from 'node:path';

const {config} = bedrock;

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
  const command = bedrock.config.cli.command.opts();
  if(command.testConfig) {
    await Promise.all(command.testConfig.split(',')
      .map(async c => import(path.join(process.cwd(), c))));
  } else {
    const testConfigPath = path.join(process.cwd(), 'test.config.js');
    if(!existsSync(testConfigPath)) {
      logger.warning('Test configuration `test.config.js` not found.');
      return;
    }
    await import(testConfigPath);
  }
});
