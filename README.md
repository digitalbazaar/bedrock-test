# bedrock-test

## Overview

Bedrock back-end testing uses Mocha while front-end testing uses Karma. To
run multiple module tests, the karma tests and mocha tests can both be
initialized and populated from this module. However, it's also possible to
run tests on a single module at a time.

## Requirements

- npm v7+

## Mocha Testing

The tests for modules are designed to run independent of a full bedrock
development environment. To run tests on a module, only the module needs
to be cloned. The test environment can be built, and tests run, locally.

For more information on Mocha, see https://mochajs.org/#getting-started

### Setup

This section describes the test environment.  A later section will
describe the actual tests.

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
Doing an `npm install` inside the module test directory populates Bedrock
modules in the test directory based on the dependencies contained in
`bedrock-module/test/package.json`.

#### How it Works

- The test environment for a module is set up and executed within that
  module's `test` directory.  A test script is set up in the `package.json` file
  to run the test suite when `npm test` is entered on the command line.

  ```js
  "scripts": {
    "test": "node --preserve-symlinks test.js test"
  }
  ```
  This will run the test file `test.js`.
- `test.js` will load the required modules, including `bedrock-test` and start Bedrock.
- `index.js` in the module's `./lib` directory will be run and any required modules are loaded from the `test/node_modules` directory.
 - The module's configuration file, `config.js`, is loaded first, but it's important to note that the last config file will override previous configurations.  For example, in our case `config.test.js` will override `config.js` since the test configuration file is loaded later.
 - `bedrock.events.on(bedrock.test.configure)` is a listener that will execute on bedrock.test.configure, which is set in the `bedrock-test` module.  This will then load `test.config.js`.
- `test.config.js` sets up the database and creates permission roles.  It also loads up all the test files contained in the `mocha` directory through this line:

  ```js
  config.mocha.tests.push(path.join(__dirname, 'mocha'));
  ```
  An array is created with all of the \*.js files in that `test/mocha` folder, and the files are executed in order. A common practice is to number these files in the order you wish the tests to execute.
- Helper functions, mock data, and other support code can be included in other files in the `test/mocha` directory.  For example, `mock.data.js` and `helpers.js` are common extra files in the bedrock module tests.

### Tests

This section describes an actual test.  Tests use mocha and chai and are found in the `test/mocha` directory.  Some highlights to point out about the tests follow.

### Quick Test Example

The following is an example of a typical test.  This one tests a regular user adding a public key through the bedrock-key addPublicKey API.

The test does some data preparation at the very beginning, then clears some of the test data between each test.  The general flow for many tests is similar to this one:
 1. Set up data and identities as needed to perform the test.
 2. Execute the test.
 3. Compare actual results to expected results.

Most of the work, and examples below, focuses on step 1: The set-up of the data and identities.

***NOTE: THESE EXAMPLES ARE OLD; bedrock identities have been removed ***

Inside the test, set-up preloads data from `mock.data.js` into the database using a helper function:
```js
var mockData = require('./mock.data');
```
```js
before(done => {
  helpers.prepareDatabase(mockData, done);
});
```
As is often the case, this data is set up to represent different identities with a particular set of system resource roles (permissions).  Within `mock.data.js`, a helper function is used to create the identity:
```js
var mock = {};
module.exports = mock;

var identities = mock.identities = {};
var userName;

userName = 'regularUser';
identities[userName] = {};
identities[userName].identity = helpers.createIdentity(userName);
```
System resource roles are added as part of the identity set-up.  The pair is usually the permission (sysRole) and the resource or resources that the permissions apply to (generateResource):
```js
identities[userName].identity.sysResourceRole.push({
  sysRole: 'bedrock-key.test',
  generateResource: 'id'
});
```
In this case, `'bedrock-key.test'` is a system role that is defined in `test.config.js` to allow the user to access, remove, create, or edit a public key for each resource:
```js
roles['bedrock-key.test'] = {
  id: 'bedrock-key.test',
  label: 'Key Test Role',
  comment: 'Role for Test User',
  sysPermission: [
    permissions.PUBLIC_KEY_REMOVE.id,
    permissions.PUBLIC_KEY_ACCESS.id,
    permissions.PUBLIC_KEY_CREATE.id,
    permissions.PUBLIC_KEY_EDIT.id
  ]
};
```
Before each test, or in-between tests, test-specific data is cleared from the database within the test:
```js
beforeEach(function(done) {
  helpers.removeCollection('publicKey', done);
});
```
Identities can be set up for a group of tests to avoid repetition.  In this case, an identity is set up for a regular user with the associated resource roles.  Several tests will be run using this identity:
```js
describe('authenticated as regularUser', () => {
  var mockIdentity = mockData.identities.regularUser;
  var actor;
  before(done => {
    brIdentity.get(null, mockIdentity.identity.id, (err, result) => {
      actor = result;
      done(err);
    });
  });
});
```
Finally, a test is executed and data checked:
```js
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
This test uses the regular user identity to test the API.  The `brKey.addPublicKey` function call will execute the test.  The comparison of expected and actual results is done using the `should` mocha directives.  If successful, the test will continue; If there is a failure, the testing will stop.

### Profiling Tests

How to profile a bedrock test suite:

Make these local modifications to any mocha test file:

```js
// do not include this in package.json; it will be installed by npx
import nsolid from 'nsolid';

describe.only('some suite', function() {
  before(async () => {
    // wait for nsolid to be ready
    await delay(5000);
    // or without `delay` library
    // await new Promise(r => setTimeout(r, 5000));

    // start nsolid profile and run for up to 60000ms
    nsolid.profile(60000);
  });

  after(() => {
    // stop the profile if it hasn't already timed out
    nsolid.profileEnd();
  });

  // it(...)
});
```

Then run:

```
npx nsolid-quickstart --npm test
```

Once the profile completes, your browser should open a page to nsolid's
UI and you can login using your GitHub ID. Then look under `assets` to
see the generated profile.

## License

[Apache License, Version 2.0](LICENSE) Copyright 2011-2024 Digital Bazaar, Inc.

Other Bedrock libraries are available under a non-commercial license for uses
such as self-study, research, personal projects, or for evaluation purposes.
See the
[Bedrock Non-Commercial License v1.0](https://github.com/digitalbazaar/bedrock/blob/main/LICENSES/LicenseRef-Bedrock-NC-1.0.txt)
for details.

Commercial licensing and support are available by contacting
[Digital Bazaar](https://digitalbazaar.com/) <support@digitalbazaar.com>.

[LICENSE]: LICENSE
