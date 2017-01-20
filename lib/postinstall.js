/*!
 * Copyright (c) 2016-2017 Digital Bazaar, Inc. All rights reserved.
 */
var fs = require('fs');

try {
  var parentPackage = require('../../../../package.json');
  // create symlink to parent module in node_modules
  fs.symlinkSync('../../', '../' + parentPackage.name, 'dir');
} catch(e) {
  // do nothing if package.json does not exist
}
