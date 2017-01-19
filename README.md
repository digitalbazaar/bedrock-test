# bedrock-test

## Overview

Bedrock back-end testing uses Mocha while front-end testing uses Protractor.  To run multiple module tests, the protractor test suite object and the mocha test array are both initialized and populated from this module; however, it’s possible to run tests on a single module at a time.

## Requirements
npm v3+

## Protractor Front-End Testing
For more information on front-end testing, see https://github.com/digitalbazaar/bedrock-protractor.

## Mocha Back-End Testing
The tests for back-end modules are designed to run independent of a full bedrock development environment.  To run tests on a module, only the module needs to be cloned.  The test environment can be built, and tests run, locally.

### Quick Examples
To run tests for a  single module, clone the module:
```
npm install bedrock-module
```
Populate required Bedrock modules in the test directory at `bedrock-modules/test`:
```
npm install
```
Run the tests from the same location:
```
npm test
```

### Setup
Doing an `npm install` inside the module test directory populates Bedrock modules in the test directory based on the dependencies contained in `bedrock-module/test/package.json`.

### How it Works
- The test environment for a module is set up and executed within that module's `test` directory.  A test script is set up in the `package.json` file to run the test suite when `npm test` is entered on the command line.

 ```
   "scripts": {
    "test": "node --preserve-symlinks test.js test"
   }
 ```
 This will run the test file `test.js`.
- `test.js` will load the required modules, including `bedrock-test` and start Bedrock. 
- `index.js` in the module's `./lib` direcotry will be run and any required modules are loaded from the `test/node_modules` directory.
 - The module's configuration file, `config.js`, is loaded first, but it's important to note that the last config file will override previous configurations.  For example, in our case `config.test.js` will override `config.js` since the test configuration file is loaded later.
 - `bedrock.events.on(bedrock.test.configure)` is a listener that will execute on bedrock.test.configure, which is set in the `bedrock-test` module.  This will then load `test.config.js`.
- `test.config.js` sets up the database and creates permission roles.  It also loads up all the test files contained in the `mocha` directory through this line:

 ```
 config.mocha.tests.push(path.join(__dirname, 'mocha'));
 ```
 An array is created with all of the \*.js files in that `test/mocha` folder, and the files are executed in order. A common practice is to number these files in the order you wish the tests to execute.
- Helper functions, mock data, and other support code can be included in other files in the `test/mocha` directory.  For example, `mock.data.js` and `helpers.js` are common extra files in the bedrock module tests.

## Authors

See the [AUTHORS][] file for author contact information.

## License

Bedrock and all Bedrock modules are:

    Copyright (c) 2011-2017 Digital Bazaar, Inc.
    All Rights Reserved

You can use Bedrock for non-commercial purposes such as self-study, research,
personal projects, or for evaluation purposes. See the [LICENSE][] file for
details about the included non-commercial license information.
