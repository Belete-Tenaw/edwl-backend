// src/controllers/didController.js
// Controller for Decentralized Identifier (DID) operations

const prisma = require('../utils/prisma');
const { resolver, createDidDocument } = require('../utils/did');

/**
 * Register a DID for a user (Agency, Employer, or JobSeeker).
 * Expected payload: { userId: string, userType: string, did: string }
 */
async function registerDid(req, res, next) {
  try {
    const { userId, userType, did } = req.body;
    if (!userId || !userType || !did) {
      return res.status(400).json({ error: 'userId, userType and did are required' });
    }
    // Ensure uniqueness of DID
    const existing = await prisma.did.findUnique({ where: { did } });
    if (existing) {
      return res.status(409).json({ error: 'DID already registered' });
    }
    const document = createDidDocument(did);
    await prisma.did.create({
      data: { did, userId, userType, document },
    });
    return res.status(201).json({ message: 'DID registered', document });
  } catch (err) {
    next(err);
  }
}

/**
 * Resolve a DID and return its document.
 * GET /api/dids/:did
 */
async function getDidDocument(req, res, next) {
  try {
    const { did } = req.params;
    const record = await prisma.did.findUnique({ where: { did } });
    if (!record) {
      return res.status(404).json({ error: 'DID not found' });
    }
    // Use the resolver to resolve (will return the stored document)
    const resolved = await resolver.resolve(did);
    return res.json({ did, document: resolved.didDocument || record.document });
  } catch (err) {
    next(err);
  }
}

module.exports = { registerDid, getDidDocument };
