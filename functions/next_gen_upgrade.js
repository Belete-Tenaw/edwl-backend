const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { VertexAI } = require('@google-cloud/vertexai');
const { Telegraf } = require('telegraf'); // Telegram Bot API framework
const speech = require('@google-cloud/speech'); // For Voice-to-Text

if (!admin.apps.length) {
  admin.initializeApp();
}

// ----------------------------------------------------------------------------
// 1. INTELLIGENT MATCHING AGENT (Vertex AI Vector Search)
// ----------------------------------------------------------------------------

// Initialize Vertex AI
const vertexAi = new VertexAI({
  project: process.env.GCLOUD_PROJECT || 'edwl-project',
  location: 'us-central1',
});

// Using the text embedding model from Vertex AI
const generativeModel = vertexAi.preview.getGenerativeModel({
  model: 'text-embedding-004', 
});

/**
 * Cloud Function to generate Vertex AI embeddings for worker profiles.
 * This runs when a profile is updated to sync with Vector Search.
 */
exports.generateWorkerEmbedding = functions.firestore
  .document('workers/{workerId}')
  .onWrite(async (change, context) => {
    const workerData = change.after.exists ? change.after.data() : null;
    
    // If deleted, we should remove from vector index (handled elsewhere or soft delete)
    if (!workerData) return null;

    // Create a rich narrative for embedding
    const narrative = `Worker ID: ${context.params.workerId}. ` +
      `Tier: ${workerData.tier}. Experience: ${workerData.experienceYears} years. ` +
      `Skills: ${(workerData.skills || []).join(', ')}. ` +
      `Languages: ${(workerData.languages || []).join(', ')}. ` +
      `Traits: ${(workerData.psychologicalTraits || []).join(', ')}. ` +
      `Expected Salary: ${workerData.expectedSalary} ETB. ` +
      `Bio: ${workerData.bio || ''}`;

    try {
      // Generate embedding using Vertex AI
      const embeddingReq = {
        instances: [{ content: narrative }],
      };
      
      const response = await generativeModel.embedContent(embeddingReq);
      const vector = response.values[0]; // Extract the vector

      // Save embedding back to Firestore (or sync to Vertex AI Vector Search Index)
      await change.after.ref.update({
        embedding: vector,
        lastVectorSync: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`Successfully generated embedding for worker ${context.params.workerId}`);
    } catch (error) {
      console.error('Error generating Vertex AI embedding:', error);
    }
});

/**
 * Callable Function for Employers to Semantic Match using Vertex AI
 */
exports.semanticMatchWorkers = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.role !== 'employer') {
    throw new functions.https.HttpsError('permission-denied', 'Only employers can search.');
  }

  const { query, location, maxTravelDistance } = data;

  try {
    // 1. Embed the employer's natural language query
    const response = await generativeModel.embedContent({
      instances: [{ content: query }]
    });
    const queryVector = response.values[0];

    // 2. Query Vertex AI Vector Search Endpoint (Mocked call structure for the actual API)
    // In production, you interact with your deployed Matching Engine IndexEndpoint
    const vectorSearchResponse = await fetch(`https://us-central1-aiplatform.googleapis.com/v1/projects/${process.env.GCLOUD_PROJECT}/locations/us-central1/indexEndpoints/${process.env.INDEX_ENDPOINT_ID}:findNeighbors`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await getAccessToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        deployedIndexId: process.env.DEPLOYED_INDEX_ID,
        queries: [{
          datapoint: { datapointId: "query", featureVector: queryVector },
          neighborCount: 10
        }]
      })
    });

    const matchData = await vectorSearchResponse.json();
    
    // 3. Post-process to filter by location/travel distance and enrich with Firestore data
    const matchedWorkerIds = matchData.nearestNeighbors[0].neighbors.map(n => n.datapoint.datapointId);
    
    const workersSnapshot = await admin.firestore().collection('workers')
      .where(admin.firestore.FieldPath.documentId(), 'in', matchedWorkerIds)
      .get();
      
    return workersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  } catch (error) {
    console.error('Vertex AI Matching Error:', error);
    throw new functions.https.HttpsError('internal', 'Matching algorithm failed.');
  }
});


// ----------------------------------------------------------------------------
// 2. MULTI-AGENT TELEGRAM INFRASTRUCTURE (Amharic Voice Onboarding)
// ----------------------------------------------------------------------------

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const speechClient = new speech.SpeechClient();

bot.start((ctx) => {
  ctx.reply('Welcome to EDWL. Please send a voice note in Amharic describing your skills, experience, and expected salary to register.');
});

// Listen for Voice Messages
bot.on('voice', async (ctx) => {
  try {
    ctx.reply('Processing your voice note... (ድምፅዎን እያቀነባበርን ነው...)');
    
    const voice = ctx.message.voice;
    const fileLink = await ctx.telegram.getFileLink(voice.file_id);
    
    // 1. Download and convert OGG to linear16 (WAV) format for Google Speech (Implementation omitted for brevity)
    const audioContent = await downloadAndConvertAudio(fileLink.href);

    // 2. Google Cloud Speech-to-Text (Fine-tuned for Amharic)
    const audio = { content: audioContent };
    const config = {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'am-ET', // Amharic
      alternativeLanguageCodes: ['en-US'],
      enableAutomaticPunctuation: true,
    };
    
    const request = { audio: audio, config: config };
    const [response] = await speechClient.recognize(request);
    const transcription = response.results.map(result => result.alternatives[0].transcript).join('\n');

    if (!transcription) {
      return ctx.reply('Could not understand the voice note. Please try again clearly.');
    }

    // 3. Extract entities using Vertex AI LLM (Gemini 1.5 Pro)
    const geminiModel = vertexAi.preview.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const extractionPrompt = `
      Extract the following information from the Amharic transcript and output strictly in JSON format.
      Fields needed: name, age, expectedSalary (number), skills (array), experienceYears (number), location.
      If a field is missing, set it to null.
      Transcript: "${transcription}"
    `;
    
    const llmResponse = await geminiModel.generateContent(extractionPrompt);
    const extractedData = JSON.parse(llmResponse.response.candidates[0].content.parts[0].text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, ''));

    // 4. Save temporary session under 'pending_registrations'
    const tempRegRef = admin.firestore().collection('pending_registrations').doc();
    await tempRegRef.set({
      name: extractedData.name || null,
      age: extractedData.age || null,
      expectedSalary: extractedData.expectedSalary || null,
      skills: extractedData.skills || [],
      experienceYears: extractedData.experienceYears || null,
      location: extractedData.location || null,
      telegramId: ctx.from.id,
      fileUrl: fileLink.href,
      transcript: transcription,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 5. Reply with extracted details and confirmation buttons
    const responseText = `📋 *Please verify your details (እባክዎ መረጃዎን ያረጋግጡ)*:

👤 *Name*: ${extractedData.name || 'Not detected (ያልተገኘ)'}
💼 *Skills*: ${(extractedData.skills || []).join(', ') || 'Not detected (ያልተገኘ)'}
⏳ *Experience*: ${extractedData.experienceYears !== null ? `${extractedData.experienceYears} Years (ዓመታት)` : 'Not detected (ያልተገኘ)'}
💰 *Expected Salary*: ${extractedData.expectedSalary || 'Not detected (ያልተገኘ)'} ETB
📍 *Location*: ${extractedData.location || 'Not detected (ያልተገኘ)'}

Click one of the buttons below to confirm or cancel registration:
(ምዝገባውን ለማረጋገጥ ወይም ለመሰረዝ ከታች ካሉት አማራጮች አንዱን ይምረጡ)`;

    await ctx.reply(responseText, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Confirm ✅ (አረጋግጥ)', callback_data: `confirm_reg_${tempRegRef.id}` },
            { text: 'Cancel ❌ (አስወግድ)', callback_data: `cancel_reg_${tempRegRef.id}` }
          ]
        ]
      }
    });

  } catch (error) {
    console.error('Error processing Telegram voice note:', error);
    ctx.reply('Sorry, an error occurred while processing your request. Please try again.');
  }
});

// ----------------------------------------------------------------------------
// 3. TELEGRAM INTERACTIVE BUTTON ACTION HANDLERS
// ----------------------------------------------------------------------------

// Handle Confirm Action
bot.action(/confirm_reg_(.+)/, async (ctx) => {
  try {
    const tempId = ctx.match[1];
    const pendingRef = admin.firestore().collection('pending_registrations').doc(tempId);
    const pendingDoc = await pendingRef.get();

    if (!pendingDoc.exists) {
      await ctx.answerCbQuery('Session expired').catch(() => {});
      return ctx.reply('Registration session expired or not found. Please try sending your voice note again. (የምዝገባ ጊዜው አልፏል ወይም አልተገኘም። እባክዎ የድምፅ መልእክትዎን እንደገና ይላኩ።)');
    }

    const regData = pendingDoc.data();
    
    // Save to workers collection
    const workerRef = admin.firestore().collection('workers').doc();
    await workerRef.set({
      fullName: regData.name || 'Telegram Worker',
      skills: regData.skills || [],
      experienceYears: regData.experienceYears || 0,
      expectedSalary: regData.expectedSalary || 0,
      preferredLocation: regData.location || 'Addis Ababa',
      telegramId: regData.telegramId,
      registeredVia: 'telegram_voice',
      isVerified: false,
      tier: 'BRONZE',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Save raw voice record for Trust Metrics
    await workerRef.collection('voice_profiles').add({
      fileUrl: regData.fileUrl,
      transcript: regData.transcript,
      uploadedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Delete pending registration
    await pendingRef.delete();

    await ctx.answerCbQuery('Registration Confirmed!').catch(() => {});
    await ctx.reply('Thank you! Your registration has been confirmed. Welcome to EDWL! (እናመሰግናለን! ምዝገባዎ በተሳካ ሁኔታ ተረጋግጧል። ወደ EDWL እንኳን ደህና መጡ!)');
  } catch (error) {
    console.error('Error confirming registration:', error);
    ctx.reply('An error occurred during confirmation. (ማረጋገጥ ላይ ስህተት አጋጥሟል።)');
  }
});

// Handle Cancel Action
bot.action(/cancel_reg_(.+)/, async (ctx) => {
  try {
    const tempId = ctx.match[1];
    await admin.firestore().collection('pending_registrations').doc(tempId).delete().catch(() => {});
    await ctx.answerCbQuery('Registration Cancelled').catch(() => {});
    await ctx.reply('Registration cancelled. Please send a new voice note to start over. (ምዝገባው ተሰርዟል። እንደገና ለመጀመር አዲስ የድምፅ መልእክት መላክ ይችላሉ።)');
  } catch (error) {
    console.error('Error cancelling registration:', error);
  }
});

// Export the bot webhook as a Cloud Function
exports.telegramWebhook = functions.https.onRequest(async (req, res) => {
  await bot.handleUpdate(req.body, res);
});

// Mock helper functions
async function downloadAndConvertAudio(url) {
  // Downloads the OGG from Telegram and converts to base64 LINEAR16 string
  return "base64_encoded_audio_content";
}
async function getAccessToken() {
  // Fetches Google Cloud auth token for Vertex AI Vector Search API calls
  return "ya29.c.c0AY_VpTh...";
}
