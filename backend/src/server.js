console.log('Starting server.js...');
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// Swagger Setup
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  // ... check integrity manually or reuse existing content if possible ...
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EDWL API',
      version: '1.0.0',
      description: 'API Documentation for Ethio Domestic Workers Link',
      contact: {
        name: 'EDWL Support',
        email: 'support@edwl.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Local server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{
      bearerAuth: []
    }],
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined.');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('FATAL ERROR: DATABASE_URL is not defined.');
  process.exit(1);
}

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://*"],
      connectSrc: ["'self'", "https://*.firebaseio.com", "https://*.googleapis.com", "https://edwl-ethio-domesticworkerslink.web.app", "https://edwl-ethio-domesticworkerslink.firebaseapp.com"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Enforce HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.status(301).redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });
}

// Request Logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.header('origin')}`);
  next();
});

const allowedOrigins = [
  'https://edwl-ethio-domesticworkerslink.web.app',
  'https://edwl-ethio-domesticworkerslink.firebaseapp.com',
  process.env.CORS_ORIGIN
].filter(Boolean);

const corsOptions = {
  origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// Strict rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 login/register requests per hour
  message: 'Too many authentication attempts, please try again after an hour'
});
app.use('/api/auth/:role/login', authLimiter);
app.use('/api/auth/admin/login', authLimiter);
app.use('/api/auth/firebase-login', authLimiter);

// Routes
// Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'UP',
    message: 'Welcome to EDWL API',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Debug Endpoint
app.get('/api/debug', async (req, res) => {
  try {
    const dbStatus = await prisma.$queryRaw`SELECT 1`.then(() => 'UP').catch(e => `DOWN: ${e.message}`);
    res.json({
      status: 'DEBUG',
      database: dbStatus,
      env: process.env.NODE_ENV,
      cors: process.env.CORS_ORIGIN || '*',
      time: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Auth Routes
app.use('/api/auth', require('./routes/auth'));

// Job Seeker Routes
app.use('/api/seekers', require('./routes/seekers'));

// Employer Routes
app.use('/api/employers', require('./routes/employers'));


// Job Post Routes
app.use('/api/jobs', require('./routes/jobs'));

// Messaging Routes
app.use('/api/messages', require('./routes/messages'));

// Admin Routes
app.use('/api/admin', require('./routes/admin'));

// Payment Routes
app.use('/api/payments', require('./routes/payment'));

// Report Routes
app.use('/api/reports', require('./routes/report'));


// 404 handler for API routes
app.use('/api', require('./middleware/notFound'));

// Serve uploads directory - available in all environments
// CRITICAL: Must be defined before the frontend catch-all route in production
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../frontend/dist/index.html'));
  });
}

// Global Error Handler (must be last)
app.use(require('./middleware/errorHandler'));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
