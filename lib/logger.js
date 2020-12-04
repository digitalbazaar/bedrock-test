/*!
 * Copyright (c) 2016-2020 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const bedrock = require('bedrock');

module.exports = bedrock.loggers.get('app').child('bedrock-test');
