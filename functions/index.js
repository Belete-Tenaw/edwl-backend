/**
 * EDWL NEXT-GEN: Core Firebase Cloud Functions
 * 
 * Migrated from OpenAI/Pinecone to Google Vertex AI Vector Search.
 * Includes Ethical Core (Living Wage, Safe-Haven, Meritocratic Mobility)
 * and the Amharic Telegram Voice Agent.
 */

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

