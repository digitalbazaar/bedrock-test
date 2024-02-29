/*!
 * Copyright 2012 - 2024 Digital Bazaar, Inc.
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

import {config} from '@bedrock/core';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// logging
config.loggers.app.filename = '/tmp/bedrock-test-app.log';
config.loggers.access.filename = '/tmp/bedrock-test-access.log';
config.loggers.error.filename = '/tmp/bedrock-test-error.log';
if(config.loggers.email) {
  config.loggers.email.silent = true;
}

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
