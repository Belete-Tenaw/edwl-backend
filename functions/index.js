const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { OpenAI } = require('openai');
const axios = require('axios');

admin.initializeApp();

// Initialize OpenAI for multilingual embeddings (text-embedding-3-small works great for Amharic/English)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || functions.config().openai.key,
});

// Pinecone or external Vector DB API URL and Key
const PINECONE_API_KEY = process.env.PINECONE_API_KEY || functions.config().pinecone.key;
const PINECONE_HOST = process.env.PINECONE_HOST || functions.config().pinecone.host;

/**
 * 1. Helper Function: Combine Profile Text
 * Converts standard JSON worker profiles into a rich narrative string for accurate embedding.
 */
function createProfileNarrative(workerData) {
  const { bio, skills, experienceYears, expectedSalary, languages, tier } = workerData;
  return `This is a ${tier} tier domestic worker with ${experienceYears} years of experience. 
  They speak ${languages.join(', ')}. 
  Skills include: ${skills.join(', ')}. 
  Expected salary is ${expectedSalary} ETB. 
  Bio: ${bio}`;
}

/**
 * 2. Webhook: Generate & Store Worker Embeddings
 * Called by your Node.js/Prisma backend whenever a JobSeeker profile is created or updated.
 */
exports.syncWorkerProfileEmbedding = functions.https.onRequest(async (req, res) => {
  // Security check: Only allow authorized requests from your main Express backend
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.BACKEND_INTERNAL_SECRET || functions.config().backend.secret}`) {
    return res.status(403).send('Unauthorized');
  }

  try {
    const workerData = req.body;
    const workerId = workerData.id;

    if (!workerId) {
      return res.status(400).json({ error: 'Worker ID is required' });
    }

    const narrative = createProfileNarrative(workerData);

    // Generate the embedding vector using OpenAI
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: narrative,
      encoding_format: 'float',
    });

    const vector = response.data[0].embedding;

    // Upsert the vector to Pinecone
    await axios.post(
      `https://${PINECONE_HOST}/vectors/upsert`,
      {
        vectors: [
          {
            id: workerId,
            values: vector,
            metadata: {
              tier: workerData.tier || 'BRONZE',
              isActive: workerData.isActive,
              locationRegion: workerData.locationRegion,
              expectedSalary: workerData.expectedSalary
            }
          }
        ]
      },
      {
        headers: {
          'Api-Key': PINECONE_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json({ success: true, message: `Embedding synced for worker ${workerId}` });
  } catch (error) {
    console.error('Error syncing worker embedding:', error);
    res.status(500).json({ error: 'Failed to sync embedding' });
  }
});

/**
 * 3. Callable Function: Smart Semantic Match
 * Allows employers to input natural language queries (English/Amharic) and get top matches.
 */
exports.smartMatchWorkers = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated via Firebase Auth
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to search.');
  }

  const { query, filters } = data;
  
  if (!query) {
    throw new functions.https.HttpsError('invalid-argument', 'Search query is required.');
  }

  try {
    // Convert employer's query into an embedding vector
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
      encoding_format: 'float',
    });

    const queryVector = response.data[0].embedding;

    // Query Pinecone Vector Database
    const pineconeResponse = await axios.post(
      `https://${PINECONE_HOST}/query`,
      {
        vector: queryVector,
        topK: 5,
        includeMetadata: true,
        filter: {
          // Push higher tiers first or apply specific filters
          isActive: { $eq: true },
          ...filters
        }
      },
      {
        headers: {
          'Api-Key': PINECONE_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const matches = pineconeResponse.data.matches.map(match => ({
      workerId: match.id,
      matchScore: match.score,
      metadata: match.metadata
    }));

    return { matches };

  } catch (error) {
    console.error('Error in smart match:', error);
    throw new functions.https.HttpsError('internal', 'An error occurred during semantic search.');
  }
});
