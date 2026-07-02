require('dotenv').config();
const Sentry = require('@sentry/node');

// --- HIGH SCALE ERROR TRACKING ---
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV
  });
}

// Initialize Telegram Bot Listener (Non-blocking) - Only outside tests
if (process.env.NODE_ENV !== 'test') {
  require('./services/telegramBot');
}
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const keepAlive = require('./utils/keepAlive');
const notificationService = require('./services/notificationService');

// Initialize Cron Jobs - Only outside tests
if (process.env.NODE_ENV !== 'test') {
  require('./jobs/automationJobs');
}

const app = express();
const PORT = process.env.PORT || 5000;

const parseOriginList = (value) => (value || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const officialFrontendUrl = 'https://ethiodomesticworkers.web.app';
const legacyFrontendUrls = [
  'https://edwl-ethio-domesticworkerslink.web.app',
  'https://edwl-ethio-domesticworkerslink.firebaseapp.com',
];
const defaultFrontendOrigins = [
  officialFrontendUrl,
  'https://ethiodomesticworkers.firebaseapp.com',
  ...legacyFrontendUrls,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];
const allowedOrigins = Array.from(new Set([
  ...defaultFrontendOrigins,
  ...parseOriginList(process.env.CORS_ORIGIN),
  ...parseOriginList(process.env.FRONTEND_URL),
]));

// --- WORLD-CLASS AUTH BRUTE FORCE PROTECTION ---
// NOTE: `authLimiter` is defined in ./middleware/rateLimiter and imported later.
// The duplicate local declaration was removed to avoid redeclaration errors during tests.

// ================================
// 🔌 SOCKET.IO SETUP
// ================================
// Socket.IO uses the same allowedOrigins as the REST API (configured below)
const http = require('http');
const { Server } = require('socket.io');
let io = null;
let server = null;

if (process.env.NODE_ENV !== 'test') {
  server = http.createServer(app);

  // Note: allowedOrigins is defined after CORS middleware - io is re-configured there
  io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
          callback(null, true);
        } else {
          callback(new Error('Socket.IO connection not allowed from: ' + origin));
        }
      },
      methods: ["GET", "POST"]
    }
  });

  // Store io in app for access in controllers
  app.set('io', io);
} else {
  app.set('io', null);
}

if (io) {
  notificationService.init(io);

  io.on('connection', (socket) => {
    socket.on('join', (userId) => {
      socket.join(userId);
    });

    socket.on('disconnect', () => {
      // Socket disconnected
    });
  });
}

// Start Keep-Alive (Zero-Cost Move)
// if (process.env.NODE_ENV === 'production' && process.env.BASE_URL) {
//   keepAlive(`${process.env.BASE_URL}/health`);
// }

// ================================
// 🔐 SECURITY: TRUST PROXY (Updated for Google Cloud Run)
// Setting to 1 tells Express exactly one trusted reverse proxy sits in front
// of the app (Cloud Run's load balancer). This is more secure than `true`
// and satisfies express-rate-limit's strict validation.
// ================================
app.set('trust proxy', 1);

// ================================
// 📘 Swagger Setup
// ================================
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EDWL API',
      version: '1.0.1',
      description: 'API Documentation for Ethio Domestic Workers Link',
      contact: {
        name: 'EDWL Support',
        email: 'support@edwl.com'
      }
    },
    servers: [
      { url: process.env.BASE_URL || `http://localhost:${PORT}`, description: 'Server' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ================================
// 🔐 HELMET SECURITY
// ================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://*"],
      connectSrc: [
        "'self'",
        "https://*.firebaseio.com",
        "https://*.googleapis.com",
        ...allowedOrigins
      ],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// ================================
// 🧾 MIDDLEWARE
// ================================
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(compression()); // Compress all textual payload bodies
app.use(express.json({ limit: '10mb' }));

// ================================
// 🔐 DYNAMIC CORS CONFIGURATION
// ================================
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    // Allow if in allowedOrigins OR if not in production
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error(`CORS not allowed from: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// ================================
// 🚦 BASIC GLOBAL RATE LIMIT
// ================================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// ENHANCED: Import new security middleware
const { csrfTokenGenerator, csrfTokenValidator } = require('./middleware/csrf');
const { 
  authLimiter,
  registerRateLimiter,
  apiLimiter,
  uploadLimiter,
  messageLimiter,
  searchLimiter,
  passwordResetLimiter,
  contactLimiter
} = require('./middleware/rateLimiter');
const { createRequestLogger } = require('./utils/logger');

// Apply global CSRF protection
app.use(csrfTokenGenerator);   // Generate CSRF tokens on all requests
app.use(csrfTokenValidator);   // Validate CSRF tokens on state-changing operations

// Apply request logging middleware
app.use(createRequestLogger());

// Apply general API rate limiter
app.use(limiter);

// ================================
// 📂 STATIC FILE SERVING
// ================================
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath, {
  maxAge: '1d', // Cache static uploads for 1 day
  setHeaders: (res) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Cache-Control', 'public, max-age=86400');
  }
}));

// ================================
// 🏠 ROOT ROUTE (Redirect to Frontend)
// ================================
app.get('/', (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || officialFrontendUrl;
  if (process.env.NODE_ENV === 'production') {
    return res.redirect(frontendUrl);
  }
  res.json({ status: 'UP', message: 'Welcome to EDWL API (Dev Mode)', version: '1.0.1' });
});

// ================================
// Start Keep-Alive (Zero-Cost Move)
if (process.env.NODE_ENV === 'production' && process.env.BASE_URL) {
  keepAlive(`${process.env.BASE_URL}/health`);
}

// ================================
// 🩺 HEALTH CHECK ROUTE (NEW)
// ================================
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ================================
// 📌 ROUTES (with ENHANCED rate limiting by endpoint)
// ================================

// Authentication routes - STRICT rate limiting (10 auth attempts/hr, 5 registrations/hr)
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.post('/api/auth/register', registerRateLimiter);
app.post('/api/auth/password-reset', passwordResetLimiter);

// General API routes - TIERED by user role
app.use('/api/seekers', apiLimiter, require('./routes/seekers'));
app.use('/api/employers', apiLimiter, require('./routes/employers'));
app.use('/api/jobs', apiLimiter, require('./routes/jobs'));

// Upload routes - STRICT (0-50 uploads/hr depending on tier)
app.use('/api/upload', uploadLimiter, require('./routes/upload'));
app.use('/api/documents', uploadLimiter, require('./routes/documents'));

// Messaging routes - STRICT (2-100 msgs/hr depending on tier)
app.use('/api/messages', messageLimiter, require('./routes/messages'));

// Search routes - MODERATE (30-300 searches/min depending on tier)
app.use('/api/search', searchLimiter);

// Admin routes - PROTECTED (no rate limit, only for admin role)
app.use('/api/admin', require('./routes/admin'));

// Contact/Support routes - MODERATE (3 submissions/hr)
app.use('/api/contact', contactLimiter);

// Other routes - inherit general API limiter
app.use('/api/hiring', apiLimiter, require('./routes/hiringRoutes'));
app.use('/api/report', apiLimiter, require('./routes/report'));
app.use('/api/payments', apiLimiter, require('./routes/payment'));
app.use('/api/reviews', apiLimiter, require('./routes/reviews'));
app.use('/api/safety', apiLimiter, require('./routes/safety'));
app.use('/api/training', apiLimiter, require('./routes/trainingRoutes'));
app.use('/api/contracts', apiLimiter, require('./routes/contracts'));
app.use('/api/escrow', apiLimiter, require('./routes/escrow'));
app.use('/api/seeker', apiLimiter, require('./routes/academy'));
app.use('/api/did', apiLimiter, require('./routes/didRoutes'));
app.use('/api/agencies', apiLimiter, require('./routes/agencyRoutes'));
app.use('/api/ai', apiLimiter, require('./routes/aiRoutes'));
app.use('/api/mediation', apiLimiter, require('./routes/mediationRoutes'));
app.use('/api/loans', apiLimiter, require('./routes/loanRoutes'));

// ================================
// 🌐 PHASE 2: OMNICHANNEL WEBHOOK
// ================================
const { handleWebhook } = require('./controllers/omnichannelWebhook');
app.post('/api/webhook/omnichannel', handleWebhook);

// ================================
// ❌ GLOBAL ERROR HANDLER
// ================================
app.use(require('./middleware/errorHandler'));

// ================================
// 🚀 SERVER START
// ================================
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}


module.exports = app;
