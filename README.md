# bedrock-test

## Overview

Bedrock back-end testing uses Mocha while front-end testing uses Protractor.  To run multiple module tests, the protractor test suite object and the mocha test array are both initialized and populated from this module; however, it’s possible to run tests on a single module at a time.

## Requirements
npm v3+

## Protractor Front-End Testing
For more information on front-end testing, see https://github.com/digitalbazaar/bedrock-protractor.

## Mocha Back-End Testing
The tests for back-end modules are designed to run independent of a full bedrock development environment.  To run tests on a module, only the module needs to be cloned.  The test environment can be built, and tests run, locally.

For more information on Mocha testing, see https://mochajs.org/#getting-started

### Setup
This section describes the test environment.  A later section will describe the actual tests.

#### Quick Setup Examples
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
Doing an `npm install` inside the module test directory populates Bedrock modules in the test directory based on the dependencies contained in `bedrock-module/test/package.json`.

#### How it Works
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

### Tests
This section describes an actual test.  Tests use mocha and chai and are found in the `test/mocha` directory.  Some highlights to point out about the tests follow.

### Quick Test Example
The following is an example of a typical test.  This one tests a regular user adding a public key through the bedrock-key addPublicKey API.  

The test does some data preperation at the very beginning, then clears some of the test data between each test.  The general flow for many tests sets up data and identites as needed to perform each test, performs the test, then compares actual results to expected results.

The test preloads data from `mock.data.js` into the database using a helper function:
```
var mockData = require('./mock.data');
```
```
  before(done => {
    helpers.prepareDatabase(mockData, done);
  });
```
This data is often set up to represent different identities with a set of resource roles (permissions).  This example also uses a helper function to create an identity with the permission to add public keys inside `mock.data.js`:
```
var mock = {};
module.exports = mock;

var identities = mock.identities = {};
var userName;

userName = 'regularUser';
identities[userName] = {};
identities[userName].identity = helpers.createIdentity(userName);
identities[userName].identity.sysResourceRole.push({
  sysRole: 'bedrock-key.test',
  generateResource: 'id'
});

```
Inbetween tests, test-specific data is cleared from the database:
```
  beforeEach(function(done) {
    helpers.removeCollection('publicKey', done);
  });
```
Identites can be set up for a group of tests to avoid repetition.  In this case, an identity is set up for a regular user with the associated resource roles:
```
  describe('authenticated as regularUser', () => {
    var mockIdentity = mockData.identities.regularUser;
    var actor;
    before(done => {
      brIdentity.get(null, mockIdentity.identity.id, (err, result) => {
        actor = result;
        done(err);
      });
    });
```
This test uses the regular user identity to test the API:
```
    it('should add a valid public key with no private key', done => {
      var samplePublicKey = {};

      samplePublicKey.publicKeyPem = mockData.goodKeyPair.publicKeyPem;
      samplePublicKey.owner = actor.id;

      async.auto({
        insert: function(callback) {
          brKey.addPublicKey(actor, samplePublicKey, callback);
        },
        test: ['insert', function(callback, results) {
          database.collections.publicKey.find({
            'publicKey.owner': actor.id
          }).toArray(function(err, result) {
            should.not.exist(err);
            should.exist(result);
            result[0].publicKey.publicKeyPem.should.equal(
              samplePublicKey.publicKeyPem);
            callback();
          });
        }],
      }, done);
    });
```

## Authors

See the [AUTHORS][] file for author contact information.

## License

Bedrock and all Bedrock modules are:

    Copyright (c) 2011-2017 Digital Bazaar, Inc.
    All Rights Reserved

You can use Bedrock for non-commercial purposes such as self-study, research,
personal projects, or for evaluation purposes. See the [LICENSE][] file for
details about the included non-commercial license information.

[AUTHORS]: AUTHORS.md
[LICENSE]: LICENSE.md

