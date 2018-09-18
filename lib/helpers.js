/*!
 * Copyright (c) 2016-2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {callbackify} = require('bedrock').util;
const httpSignatureHeader = require('http-signature-header');
const jsprim = require('jsprim');
const signatureAlgorithms = require('signature-algorithms');

const api = {};
module.exports = api;

/**
 * Add HTTPSignatures headers to a given `requestOptions` object.  This is
 * compatible with both `request` and `axios` libraries.
 *
 * @param algorithm the signing algorithm to use (e.g. rsa-sha256, ed25519).
 * @param identity the identity as typically constructed in mock.data.js
 * @param requestOptions the request options.
 */
api.createHttpSignatureRequest = callbackify(async (
  {algorithm, identity, requestOptions}) => {
  requestOptions.headers = requestOptions.headers || {};
  if(!requestOptions.headers.date) {
    requestOptions.headers.date = jsprim.rfc1123(new Date());
  }
  const includeHeaders = ['date', 'host', '(request-target)'];
  const plaintext = httpSignatureHeader.createSignatureString(
    {includeHeaders, requestOptions});
  const keyId = identity.keys.publicKey.id;
  const authzHeaderOptions = {includeHeaders, keyId};
  const cryptoOptions = {plaintext};
  if(algorithm.startsWith('rsa')) {
    authzHeaderOptions.algorithm = algorithm;
    const alg = algorithm.split('-');
    const {privateKeyPem} = identity.keys.privateKey;
    cryptoOptions.algorithm = alg[0];
    cryptoOptions.privateKeyPem = privateKeyPem;
    cryptoOptions.hashType = alg[1];
  }
  if(algorithm === 'ed25519') {
    const {privateKeyBase58} = identity.keys.privateKey;
    cryptoOptions.algorithm = algorithm;
    cryptoOptions.privateKeyBase58 = privateKeyBase58;
  }

  authzHeaderOptions.signature = await signatureAlgorithms.sign(cryptoOptions);
  requestOptions.headers.Authorization = httpSignatureHeader.createAuthzHeader(
    authzHeaderOptions);
});
