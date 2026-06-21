// utils/did.js
// Helper for Decentralized Identifier (DID) generation and resolution
// Uses did:web method for simplicity; can be swapped for other methods later.

const { Resolver } = require('did-resolver');
const { getResolver: getWebResolver } = require('web-did-resolver');

// Initialize a resolver that knows about did:web
const resolver = new Resolver({
  ...getWebResolver(),
});

// Simple factory to create a DID document structure
function createDidDocument(did) {
  return {
    '@context': ['https://www.w3.org/ns/did/v1'],
    id: did,
    verificationMethod: [],
    authentication: [],
    service: [],
  };
}

module.exports = {
  resolver,
  createDidDocument,
};
