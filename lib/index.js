/*
 * Bedrock Test Module.
 *
 * Copyright (c) 2016 Digital Bazaar, Inc. All rights reserved.
 */

var bedrock = require('bedrock');
var config = bedrock.config;
var fs = require('fs');
var path = require('path');

var api = {};
module.exports = api;

bedrock.events.on('bedrock.test.configure', function() {
  // reinitialize mocha test array
  config.mocha.tests = [];
  require(process.cwd() + '/test.config');
});

api.require = function(module) {
  var parentName = require('../../../../package.json').name;
  // look into the symlinked parent module path for target module
  var modulePath = path.join(
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
