console.log('Starting server.js...');
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// Swagger Setup
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
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
    servers: [{ url: `http://localhost:${PORT}`, description: 'Local server' }],
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

// CORS Configuration
app.use(cors({
  origin: true,
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());

// --- FIXED STATIC FILE SERVING ---
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));
console.log(`✅ Static files being served from: ${uploadsPath}`);
// ---------------------------------

// Routes
app.get('/', (req, res) => {
  res.json({ status: 'UP', message: 'Welcome to EDWL API', version: '1.0.1' });
});

// Import existing routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/seekers', require('./routes/seekers'));
app.use('/api/employers', require('./routes/employers'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/admin', require('./routes/admin'));

// --- NEW ROUTE FOR HIRING REQUIREMENTS ---
app.use('/api/hiring', require('./routes/hiringRoutes'));

// Global Error Handler
app.use(require('./middleware/errorHandler'));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;