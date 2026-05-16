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

// --- WORLD-CLASS AUTH BRUTE FORCE PROTECTION ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 login/register requests per window
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ================================
// 🔌 SOCKET.IO SETUP
// ================================
// Socket.IO uses the same allowedOrigins as the REST API (configured below)
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);

// Note: allowedOrigins is defined after CORS middleware - io is re-configured there
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const socketAllowed = [
        'https://edwl-ethio-domesticworkerslink.web.app',
        'https://edwl-ethio-domesticworkerslink.firebaseapp.com',
        'http://localhost:3000',
        ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [])
      ];
      if (socketAllowed.includes(origin) || process.env.NODE_ENV !== 'production') {
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
notificationService.init(io);

io.on('connection', (socket) => {
  

  socket.on('join', (userId) => {
    socket.join(userId);
    
  });

  socket.on('disconnect', () => {
    
  });
});

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
        "https://edwl-ethio-domesticworkerslink.web.app",
        "https://edwl-ethio-domesticworkerslink.firebaseapp.com"
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
const envOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
const allowedOrigins = [
  'https://edwl-ethio-domesticworkerslink.web.app',
  'https://edwl-ethio-domesticworkerslink.firebaseapp.com',
  'http://localhost:3000',
  'http://localhost:3001',
  ...envOrigins
];

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
  const frontendUrl = 'https://edwl-ethio-domesticworkerslink.web.app';
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
// 📌 ROUTES
// ================================
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/seekers', require('./routes/seekers'));
app.use('/api/employers', require('./routes/employers'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/hiring', require('./routes/hiringRoutes'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/report', require('./routes/report'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/payments', require('./routes/payment'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/safety', require('./routes/safety'));
app.use('/api/training', require('./routes/trainingRoutes'));
app.use('/api/contracts', require('./routes/contracts'));
app.use('/api/escrow', require('./routes/escrow'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/seeker', require('./routes/academy'));
app.use('/api/loans', require('./routes/loanRoutes'));
app.use('/api/agencies', require('./routes/agencyRoutes'));
app.use('/api/mediation', require('./routes/mediationRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

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
