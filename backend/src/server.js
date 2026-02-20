console.log('Starting server.js...');
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const keepAlive = require('./utils/keepAlive');

const app = express();
// Google Cloud Run sets the PORT variable automatically to 8080
const PORT = process.env.PORT || 8080;

// Start Keep-Alive (Zero-Cost Move)
// if (process.env.NODE_ENV === 'production' && process.env.BASE_URL) {
//   keepAlive(`${process.env.BASE_URL}/health`);
// }

// ================================
// 🔐 SECURITY: TRUST PROXY (Updated for Google Cloud Run)
// ================================
app.set('trust proxy', true);

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
// 🔐 DYNAMIC CORS CONFIGURATION
// ================================
const envOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
const allowedOrigins = [
  'https://edwl-ethio-domesticworkerslink.web.app',
  'https://edwl-ethio-domesticworkerslink.firebaseapp.com',
  'http://localhost:3000',
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
// 🧾 MIDDLEWARE
// ================================
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));

// ================================
// 📂 STATIC FILE SERVING
// ================================
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// ================================
// 🏠 ROOT ROUTE
// ================================
app.get('/', (req, res) => {
  res.json({ status: 'UP', message: 'Welcome to EDWL API', version: '1.0.1' });
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
app.use('/api/auth', require('./routes/auth'));
app.use('/api/seekers', require('./routes/seekers'));
app.use('/api/employers', require('./routes/employers'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/hiring', require('./routes/hiringRoutes'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/report', require('./routes/report'));
app.use('/api/payments', require('./routes/payment'));

// ================================
// ❌ GLOBAL ERROR HANDLER
// ================================
app.use(require('./middleware/errorHandler'));

// ================================
// 🚀 SERVER START
// ================================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ EDWL Backend is live on port ${PORT}`);
});

module.exports = app;