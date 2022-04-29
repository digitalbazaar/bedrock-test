/*!
 * Copyright (c) 2012-2022 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import cycle from 'cycle';
import fs from 'node:fs';
import {logger} from './logger.js';
import Mocha from 'mocha';
import path from 'node:path';

const {config, util: {BedrockError}} = bedrock;
const {
  EVENT_FILE_PRE_REQUIRE,
  EVENT_FILE_POST_REQUIRE,
  EVENT_FILE_REQUIRE
} = Mocha.Suite.constants;

bedrock.events.on('bedrock-cli.init', async () => {
  // add test command
  const command = bedrock.program
    .command('test')
    .description('run tests')
    .option(
      '--framework <frameworks>',
      'A set of comma-delimited test frameworks to run. [all] ' +
      '(' + config.test.frameworks.join(', ') + ')')
    .action(function() {
      config.cli.command = command;
    });

  // allow special test configs to load
  await bedrock.events.emit('bedrock-cli.test.configure', command);
});

bedrock.events.on('bedrock-cli.ready', async () => {
  const command = config.cli.command;
  if(command.name() !== 'test') {
    return;
  }

  // set reporter
  const opts = command.opts();
  if(opts.mochaReporter) {
    config.mocha.options.reporter = opts.mochaReporter;
  }

  await bedrock.events.emit('bedrock.test.configure');
});

bedrock.events.on('bedrock.started', async () => {
  if(config.cli.command.name() === 'test') {
    const state = {pass: true};
    await bedrock.runOnce('bedrock.test', async () => {
      console.log('Running Test Frameworks...\n');
      logger.info('running test frameworks...');
      try {
        await bedrock.events.emit('bedrock.tests.run', state);
        if(!state.pass) {
          console.log('Tests failed.');
          logger.error('tests failed.');
          process.exit(1);
        } else {
          console.log('All tests passed.');
          logger.info('all tests passed.');
          bedrock.exit();
        }
      } catch(err) {
        console.log('Tests exited with error', err);
        logger.error('tests exited with error', err);
        process.exit(err.code || 0);
      }
    });
    return false;
  }
});

bedrock.events.on('bedrock-cli.test.configure', function(command) {
  command
    .option(
      '--mocha-test <files>',
      'A set of comma-delimited mocha test files to run.')
    .option('--mocha-reporter <reporter>',
      'Mocha test reporter [spec]', 'spec');
});

bedrock.events.on('bedrock.tests.run', async state => {
  if(shouldRunFramework('mocha')) {
    return runMocha(state);
  }
});

/**
 * Check if a test framework is runnable.
 *
 * @param {string} framework - The framework to check.
 *
 * @returns {boolean} True if the framework is runnable, false if not.
 */
export function shouldRunFramework(framework) {
  const frameworks = config.cli.command.opts().framework;
  // default to run, else check for name in frameworks list
  return !frameworks || frameworks.split(/[ ,]+/).includes(framework);
}

/**
 * Run Mocha-based tests.
 *
 * @param {object} state - The global test state.
 */
async function runMocha(state) {
  // setup chai / chai-as-promised
  chai.use(chaiAsPromised);

  // set globals for tests to use
  global.chai = chai;
  global.should = chai.should();

  global.assertNoError = err => {
    if(err) {
      const obj = err instanceof BedrockError ? err.toObject() : err;
      let pretty = null;
      try {
        pretty = JSON.stringify(obj, null, 2);
      } catch(e) {
        // we need to remove circular references from the json
        // in order to pretty print with JSON.stringify
        pretty = JSON.stringify(cycle.decycle(obj), null, 2);
      }
      console.error('An unexpected error occurred: ', pretty);
      throw err;
    }
  };

  const mocha = new Mocha(config.mocha.options);

  // add test files
  const opts = config.cli.command.opts();
  if(opts.mochaTest) {
    opts.mochaTest.split(',').forEach(function(path) {
      _add(path);
    });
  } else {
    config.mocha.tests.forEach(function(path) {
      _add(path);
    });
  }

  // console.log w/o eol
  process.stdout.write('Running Mocha tests...');

  // load all test files
  await _loadFilesAsync();

  return new Promise(resolve => {
    state.mocha = {};
    mocha.run(function(failures) {
      if(failures) {
        state.mocha.failures = failures;
        state.pass = false;
      }
      resolve();
    });
  });

  // add a file or directory
  function _add(_path) {
    if(fs.existsSync(_path)) {
      const stats = fs.statSync(_path);
      if(stats.isDirectory()) {
        fs.readdirSync(_path).sort().forEach(function(file) {
          if(path.extname(file) === '.js') {
            file = path.join(_path, file);
            logger.debug('adding test file', {file});
            mocha.addFile(file);
          }
        });
      } else if(path.extname(_path) === '.js') {
        logger.debug('adding test file', {file: _path});
        mocha.addFile(_path);
      }
    }
  }

  // loads all test files asynchronously; this function must execute here
  // and not inside mocha's CJS file due to a segfault that will occur during
  // dynamic imports: https://github.com/nodejs/node/issues/35889
  async function _loadFilesAsync() {
    const suite = mocha.suite;
    mocha.lazyLoadFiles(true);
    for(const file of mocha.files) {
      suite.emit(EVENT_FILE_PRE_REQUIRE, global, file, mocha);
      const resultModule = await import(file);
      suite.emit(EVENT_FILE_REQUIRE, resultModule, file, mocha);
      suite.emit(EVENT_FILE_POST_REQUIRE, global, file, mocha);
    }
  }
}
