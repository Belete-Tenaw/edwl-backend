# EDWL Implementation & Deployment Checklist

**Status**: 🔄 IN PROGRESS  
**Phase**: Comprehensive Security & SEO Hardening  
**Last Updated**: 2026-06-26

---

## 🎯 IMPLEMENTATION ROADMAP

### Phase 1: Critical Security (Week 1) - ACTIVE

#### ✅ Completed
- [x] Security configuration module (`backend/src/config/security.js`)
- [x] CSRF protection middleware (`backend/src/middleware/csrf.js`)
- [x] Enhanced rate limiting (`backend/src/middleware/rateLimiter.js`)
- [x] File upload validation (`backend/src/middleware/fileUpload.js`)
- [x] Input validation utilities (`backend/src/utils/validators.js`)
- [x] Structured logging (`backend/src/utils/logger.js`)
- [x] Database transactions (`backend/src/utils/transactions.js`)
- [x] SEO generation script (`scripts/generate-seo.js`)
- [x] API documentation (`API_DOCUMENTATION.md`)
- [x] Security audit fixes doc (`SECURITY_AUDIT_FIXES.md`)

#### TODO
- [ ] 1.1 Update password validation in auth controller
  - **File**: `backend/src/controllers/authController.js`
  - **Action**: Replace `password.length < 6` with `validatePassword()` from security module
  - **Est. Time**: 30 min

- [ ] 1.2 Implement JWT token expiry
  - **File**: `backend/src/middleware/auth.js`
  - **Action**: Add token expiry validation, implement refresh token endpoint
  - **Est. Time**: 1 hour

- [ ] 1.3 Deploy CSRF middleware
  - **File**: `backend/src/server.js`
  - **Action**: Add `csrfTokenGenerator` and `csrfTokenValidator` middleware
  - **Est. Time**: 30 min

- [ ] 1.4 Integrate rate limiters
  - **File**: `backend/src/server.js` and route files
  - **Action**: Apply rate limiters to all endpoints
  - **Est. Time**: 1.5 hours

- [ ] 1.5 Implement PII encryption
  - **Files**: 
    - `backend/prisma/schema.prisma`
    - `backend/src/controllers/userController.js`
  - **Action**: Encrypt phone, email, security answers before storage
  - **Est. Time**: 2 hours

- [ ] 1.6 Add security headers to server
  - **File**: `backend/src/server.js`
  - **Headers Required**:
    - X-Content-Type-Options: nosniff
    - X-Frame-Options: DENY
    - X-XSS-Protection: 1; mode=block
    - Strict-Transport-Security
    - Content-Security-Policy
  - **Est. Time**: 30 min

- [ ] 1.7 Generate SEO files
  - **Command**: `npm run generate-seo`
  - **Output**: robots.txt, sitemap.xml, schema files
  - **Est. Time**: 15 min

### Phase 2: High Priority (Week 2)

- [ ] 2.1 Implement API versioning
  - Create `/api/v1/` routes
  - Set up deprecation warnings
  - **Est. Time**: 2 hours

- [ ] 2.2 Add email verification
  - Implement OTP/verification code system
  - Send verification emails
  - **Est. Time**: 2 hours

- [ ] 2.3 Implement audit logging
  - Integrate Winston logger from `backend/src/utils/logger.js`
  - Log all critical actions
  - **Est. Time**: 1.5 hours

- [ ] 2.4 Add input validation middleware
  - Apply `validateProfileData()`, `validateJobPostData()`
  - **Est. Time**: 1 hour

- [ ] 2.5 Backup & recovery setup
  - Configure automated PostgreSQL backups
  - Test restore procedures
  - **Est. Time**: 3 hours

### Phase 3: Medium Priority (Week 3-4)

- [ ] 3.1 Frontend SEO optimization
  - Add meta tags
  - Implement Open Graph
  - Add JSON-LD schema
  - **Est. Time**: 2 hours

- [ ] 3.2 Performance optimization
  - Code splitting
  - Image optimization
  - Caching strategy
  - **Est. Time**: 3 hours

- [ ] 3.3 GDPR compliance
  - Data deletion endpoint
  - Data portability export
  - Privacy policy updates
  - **Est. Time**: 3 hours

- [ ] 3.4 Security penetration testing
  - Professional audit (external)
  - **Est. Time**: 1 week

---

## 🛠️ Implementation Details

### 1.1 Password Validation Update

**File**: `backend/src/controllers/authController.js`

**Before**:
```javascript
if (!password || password.length < 6) {
  return res.status(400).json({ error: 'Password too short' });
}
```

**After**:
```javascript
const { validatePassword, hashPassword } = require('../config/security');

const validation = validatePassword(password);
if (!validation.valid) {
  return res.status(400).json({ 
    error: 'Password does not meet requirements',
    requirements: validation.errors 
  });
}

const hashedPassword = await hashPassword(password);
```

### 1.2 JWT Token Expiry

**File**: `backend/src/middleware/auth.js`

**Action Required**:
```javascript
const jwt = require('jsonwebtoken');
const { JWT_CONFIG } = require('../config/security');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, {
    expiresIn: JWT_CONFIG.accessTokenExpiry,
    issuer: JWT_CONFIG.issuer,
    audience: JWT_CONFIG.audience,
  }, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
      }
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}
```

### 1.3 CSRF Middleware Integration

**File**: `backend/src/server.js`

```javascript
const { csrfTokenGenerator, csrfTokenValidator } = require('./middleware/csrf');

// Add after session middleware
app.use(csrfTokenGenerator);

// Add before state-changing operations
app.use('/api/v1', csrfTokenValidator);

// Exempt specific routes if needed
app.get('/api/v1/csrf-token', (req, res) => {
  res.json({ csrfToken: req.session.csrfToken });
});
```

### 1.4 Rate Limiter Integration

**File**: `backend/src/server.js`

```javascript
const {
  authLimiter,
  apiLimiter,
  uploadLimiter,
  messageLimiter,
  searchLimiter,
  passwordResetLimiter,
} = require('./middleware/rateLimiter');

// Auth routes
app.post('/api/v1/auth/login', authLimiter, authController.login);
app.post('/api/v1/auth/register', registerRateLimiter, authController.register);

// API routes
app.use('/api/v1', apiLimiter);

// Specific limiters override global
app.post('/api/v1/upload', uploadLimiter, uploadController.upload);
app.post('/api/v1/messages', messageLimiter, messageController.send);
app.get('/api/v1/jobs', searchLimiter, jobController.list);
app.post('/api/v1/auth/password-reset', passwordResetLimiter, authController.resetPassword);
```

### 1.5 PII Encryption Implementation

**Schema Update** (`backend/prisma/schema.prisma`):
```prisma
model JobSeeker {
  id              String   @id @default(cuid())
  
  // Regular fields
  firstName       String
  lastName        String
  email           String   @unique
  
  // Fields to encrypt (store as JSON or string)
  phone           String?  // Stored encrypted
  phoneIv         String?  // IV for AES-256-GCM
  phoneAuthTag    String?  // Auth tag for AES-256-GCM
  
  securityAnswer  String?  // Encrypted
  securityAnswerIv String?
  securityAnswerAuthTag String?
  
  // ... other fields
}
```

**Controller Update** (`backend/src/controllers/userController.js`):
```javascript
const { encryptPII, decryptPII } = require('../config/security');

// When storing
const encrypted = encryptPII(phoneNumber);
await prisma.jobSeeker.update({
  where: { id: userId },
  data: {
    phone: encrypted.encryptedData,
    phoneIv: encrypted.iv,
    phoneAuthTag: encrypted.authTag,
  }
});

// When retrieving
const decrypted = decryptPII({
  encryptedData: user.phone,
  iv: user.phoneIv,
  authTag: user.phoneAuthTag,
});
```

### 1.6 Security Headers Setup

**File**: `backend/src/server.js`

```javascript
// Add security headers middleware
app.use((req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // HTTPS only
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self'"
  );
  
  // No referrer
  res.setHeader('Referrer-Policy', 'no-referrer');
  
  // Disable caching for sensitive content
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  
  next();
});
```

---

## 📋 Testing Checklist

### Security Testing
- [ ] Password validation enforced (test weak passwords rejected)
- [ ] CSRF tokens required (test POST without token fails)
- [ ] Rate limits enforced (test 11th login fails)
- [ ] File upload validation works (test non-image rejected)
- [ ] XSS protection (test HTML tags in input removed)
- [ ] JWT expiry (test 15min token refresh required)
- [ ] PII encryption (test encrypted in DB, decrypted in memory only)

### SEO Testing
- [ ] robots.txt accessible at `https://edwl.io/robots.txt`
- [ ] Sitemap accessible at `https://edwl.io/sitemap.xml`
- [ ] Meta tags present in HTML head
- [ ] JSON-LD schema valid (test with https://validator.schema.org/)
- [ ] Mobile responsive (test on device)
- [ ] Amharic content indexed (test with Google Search Console)

### Performance Testing
- [ ] Page load time < 3 seconds
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1

### Functionality Testing
- [ ] User registration flow works
- [ ] Email verification works
- [ ] Login/logout works
- [ ] Profile update works
- [ ] File upload works
- [ ] Messaging works
- [ ] Payment subscription works

---

## 🚀 Deployment Steps

### Pre-Deployment

```bash
# 1. Update dependencies
npm audit
npm update

# 2. Run tests
npm test

# 3. Build frontend
npm run build --prefix frontend

# 4. Generate SEO files
npm run generate-seo

# 5. Database backup
npm run backup:database

# 6. Security scan
npm run security:scan
```

### Deployment

```bash
# 1. Set environment variables in production
export NODE_ENV=production
export JWT_SECRET=$(openssl rand -hex 32)
export ENCRYPTION_KEY=$(openssl rand -hex 32)
export DB_URL=postgresql://...

# 2. Run migrations
npm run migrate:deploy

# 3. Start application
npm run start

# 4. Verify deployment
npm run health:check
```

### Post-Deployment

```bash
# 1. Submit sitemap to Google Search Console
# 2. Submit sitemap to Bing Webmaster Tools
# 3. Monitor logs
npm run logs:monitor

# 4. Run penetration testing
npm run security:pentest

# 5. Monitor performance
npm run monitor:performance
```

---

## 📊 Success Metrics

### Security
- ✅ 0 exposed credentials
- ✅ 0 SQL injection vulnerabilities
- ✅ 0 XSS vulnerabilities
- ✅ All endpoints rate-limited
- ✅ All PII encrypted

### SEO
- ✅ Indexed in Google (all pages)
- ✅ Indexed in Bing
- ✅ Amharic & English keywords ranking
- ✅ Mobile-friendly (100% PageSpeed)
- ✅ Core Web Vitals passing

### Performance
- ✅ Page load < 3s
- ✅ 99.9% uptime
- ✅ API response < 200ms
- ✅ Database query < 100ms

### User Experience
- ✅ No broken links
- ✅ Error messages helpful
- ✅ Responsive on all devices
- ✅ Bilingual navigation

---

## 🔧 Troubleshooting

### Issue: CSRF token validation failing

**Solution**:
1. Verify session middleware is configured
2. Check X-CSRF-Token header is being sent
3. Verify token is being stored in session
4. Check Same-Site cookie policy

### Issue: Rate limiting too strict

**Solution**:
1. Adjust max values in `rateLimiter.js`
2. Increase windowMs if needed
3. Create exemptions for internal IPs
4. Test with staging environment first

### Issue: File uploads failing

**Solution**:
1. Check file size < 10MB
2. Verify MIME type is whitelisted
3. Check directory permissions
4. Verify virus scanner is running

---

## 📞 Support

For questions on implementation:
1. Review code examples in SECURITY_AUDIT_FIXES.md
2. Check API_DOCUMENTATION.md for endpoint details
3. Run `npm run docs` for detailed guides
4. Contact security team for vulnerabilities

**Status**: 🔄 Ready for Phase 1 Implementation
