/*
 * Copyright (c) 2016 Digital Bazaar, Inc. All rights reserved.
 */

var fs = require('fs');

var parentPackage = require('../../../../package.json');

// create symlink to parent module in node_modules
fs.symlinkSync('../../', '../' + parentPackage.name, 'dir');
