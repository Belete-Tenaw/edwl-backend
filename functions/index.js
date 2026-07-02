/**
 * EDWL NEXT-GEN: Core Firebase Cloud Functions
 * 
 * Migrated from OpenAI/Pinecone to Google Vertex AI Vector Search.
 * Includes Ethical Core (Living Wage, Safe-Haven, Meritocratic Mobility)
 * and the Amharic Telegram Voice Agent.
 */

const functions = require('firebase-functions');
const axios = require('axios');

const RENDER_BACKEND_URL = 'https://edwl-backend.onrender.com';
const ALLOWED_FRONTEND_ORIGINS = new Set([
  'https://ethiodomesticworkers.web.app',
  'https://ethiodomesticworkers.firebaseapp.com',
  'https://edwl-ethio-domesticworkerslink.web.app',
  'https://edwl-ethio-domesticworkerslink.firebaseapp.com',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);
const HOP_BY_HOP_HEADERS = new Set([
  'host',
  'connection',
  'content-length',
  'origin',
  'referer',
  'accept-encoding',
  'transfer-encoding',
  'upgrade',
  'sec-websocket-key',
  'sec-websocket-version',
  'sec-websocket-extensions',
]);

const getRequestPath = (req) => {
  const url = req.originalUrl || req.url || '/';

  if (url === '/api/health' || url.startsWith('/api/health?')) {
    return url.replace(/^\/api\/health/, '/health');
  }

  return url;
};

const getProxyHeaders = (req) => {
  const headers = {};

  Object.entries(req.headers || {}).forEach(([key, value]) => {
    const lowerKey = key.toLowerCase();
    if (!HOP_BY_HOP_HEADERS.has(lowerKey) && !lowerKey.startsWith('x-forwarded-')) {
      headers[key] = value;
    }
  });

  headers['x-edwl-proxy'] = 'firebase-hosting';
  return headers;
};

const setCorsHeaders = (req, res) => {
  const origin = req.headers.origin;
  if (ALLOWED_FRONTEND_ORIGINS.has(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Vary', 'Origin');
  }
  res.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  res.set('Access-Control-Allow-Credentials', 'true');
};

exports.api = functions
  .runWith({ timeoutSeconds: 60, memory: '512MB' })
  .https.onRequest(async (req, res) => {
    setCorsHeaders(req, res);

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    const targetUrl = `${RENDER_BACKEND_URL}${getRequestPath(req)}`;

    try {
      const upstream = await axios({
        url: targetUrl,
        method: req.method,
        headers: getProxyHeaders(req),
        data: ['GET', 'HEAD'].includes(req.method) ? undefined : req.rawBody,
        responseType: 'arraybuffer',
        validateStatus: () => true,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });

      Object.entries(upstream.headers || {}).forEach(([key, value]) => {
        const lowerKey = key.toLowerCase();
        if (!HOP_BY_HOP_HEADERS.has(lowerKey) && lowerKey !== 'content-security-policy') {
          res.set(key, value);
        }
      });

      res.status(upstream.status).send(Buffer.from(upstream.data));
    } catch (error) {
      console.error('[EDWL API Proxy] Request failed', {
        targetUrl,
        method: req.method,
        message: error.message,
      });
      res.status(502).json({
        error: 'EDWL secure service proxy failed',
        message: 'Please try again shortly.',
      });
    }
  });

// 1. Next-Gen Matching & Agents (Vertex AI + Telegram Bot)
const nextGen = require('./next_gen_upgrade');
exports.generateWorkerEmbedding = nextGen.generateWorkerEmbedding;
exports.semanticMatchWorkers = nextGen.semanticMatchWorkers;
exports.telegramWebhook = nextGen.telegramWebhook;

// 2. The Ethical Core (Dignity of Labor, Safety, Meritocracy)
const ethicalCore = require('./ethical_core');
exports.calculateLivingWage = ethicalCore.calculateLivingWage;
exports.triggerSafeHaven = ethicalCore.triggerSafeHaven;
exports.unlockCertification = ethicalCore.unlockCertification;
