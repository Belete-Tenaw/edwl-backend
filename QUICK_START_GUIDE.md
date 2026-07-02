# EDWL Security & SEO Quick-Start Guide

**For**: Development Team  
**Date**: 2026-06-26  
**Priority**: URGENT - Implement Phase 1 this week

---

## 🚀 5-MINUTE OVERVIEW

EDWL has received a comprehensive security and SEO audit. Here's what you need to do:

### THIS WEEK (Critical)
1. Update password validation (30 min)
2. Add CSRF protection (30 min)
3. Implement JWT expiry (1 hour)
4. Deploy rate limiting (1.5 hours)
5. Encrypt PII in DB (2 hours)

**Total**: ~5 hours of work

### NEXT WEEK (High Priority)
- API versioning, email verification, audit logging

### AFTER THAT (Medium Priority)
- Frontend SEO, performance optimization, GDPR

---

## 📁 New Files You Need to Use

### Security Modules (Just Created)
```
backend/src/config/security.js          ← Core security config
backend/src/middleware/csrf.js          ← CSRF protection
backend/src/middleware/rateLimiter.js   ← Rate limiting (UPDATED)
backend/src/middleware/fileUpload.js    ← File validation
backend/src/utils/validators.js         ← Input validation
backend/src/utils/logger.js             ← Logging
backend/src/utils/transactions.js       ← Database transactions
frontend/src/components/SEOMetaTags.jsx ← React SEO component
scripts/generate-seo.js                 ← Generate sitemap/robots.txt
```

### Documentation Files
```
SECURITY_AUDIT_FIXES.md              ← How to implement security fixes
API_DOCUMENTATION.md                 ← Complete API reference
IMPLEMENTATION_CHECKLIST.md          ← Phase-by-phase roadmap
COMPREHENSIVE_AUDIT_REPORT.md        ← Full audit results
```

---

## 🔧 TASK 1: Update Password Validation (30 min)

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

try {
  const hashedPassword = await hashPassword(password);
  // Continue with user creation...
} catch (error) {
  return res.status(400).json({ error: error.message });
}
```

**Tests**:
- ✅ Test: `pass123` (too short) → Should fail
- ✅ Test: `Pass123!@` (valid) → Should work
- ✅ Test: `Password123Password123` (repeated chars) → Should fail
- ✅ Test: `Admin123!` (common word) → Should fail

---

## 🔐 TASK 2: Add CSRF Protection (30 min)

**File**: `backend/src/server.js`

**Add after session middleware**:
```javascript
const { csrfTokenGenerator, csrfTokenValidator } = require('./middleware/csrf');

app.use(csrfTokenGenerator);    // Generate CSRF tokens
app.use(csrfTokenValidator);    // Validate on POST/PUT/DELETE
```

**Frontend Integration**:
```javascript
// 1. Get token from response header
const token = document.querySelector('meta[name="csrf-token"]')?.content 
          || fetch('/api/v1/csrf-token').then(r => r.json()).then(d => d.csrfToken);

// 2. Include in POST requests
fetch('/api/v1/profile', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

**Tests**:
- ✅ POST without CSRF token → 403 error
- ✅ POST with valid CSRF token → Success
- ✅ GET request (no token needed) → Success

---

## ⏱️ TASK 3: Implement JWT Expiry (1 hour)

**File**: `backend/src/middleware/auth.js`

```javascript
const jwt = require('jsonwebtoken');
const { JWT_CONFIG } = require('../config/security');

function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      expiresIn: JWT_CONFIG.accessTokenExpiry,
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
    });
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
        refreshNeeded: true 
      });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
}
```

**Also add refresh endpoint** in `authController.js`:
```javascript
async function refreshToken(req, res) {
  const { refreshToken } = req.body;
  
  // Verify refresh token
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  
  // Generate new access token
  const accessToken = jwt.sign(
    { userId: decoded.userId, role: decoded.role },
    process.env.JWT_SECRET,
    { 
      expiresIn: JWT_CONFIG.accessTokenExpiry,
      issuer: JWT_CONFIG.issuer 
    }
  );

  res.json({ accessToken, expiresIn: 900 });
}
```

**Tests**:
- ✅ Token works for first 15 minutes
- ✅ After 15 minutes, returns TOKEN_EXPIRED
- ✅ Refresh token generates new access token
- ✅ Refresh token valid for 7 days

---

## 🛡️ TASK 4: Deploy Rate Limiting (1.5 hours)

**File**: `backend/src/server.js`

```javascript
const {
  authLimiter,
  registerRateLimiter,
  apiLimiter,
  uploadLimiter,
  messageLimiter,
  searchLimiter,
} = require('./middleware/rateLimiter');

// Apply to routes
app.post('/api/v1/auth/login', authLimiter, authController.login);
app.post('/api/v1/auth/register', registerRateLimiter, authController.register);

app.use('/api/v1', apiLimiter);  // General API limiter

// Specific high-security endpoints
app.post('/api/v1/upload', uploadLimiter, uploadController.upload);
app.post('/api/v1/messages', messageLimiter, messageController.send);
app.get('/api/v1/jobs', searchLimiter, jobController.list);
```

**Tests**:
- ✅ 11th login in 1 hour → 429 error
- ✅ 6th registration → 429 error
- ✅ Subscriber user gets 2x limit
- ✅ Rate limit headers in response

**Check response headers**:
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1234567890
```

---

## 🔒 TASK 5: Encrypt PII in Database (2 hours)

### Step 1: Update Schema

**File**: `backend/prisma/schema.prisma`

Add to `JobSeeker` model:
```prisma
model JobSeeker {
  // Existing fields
  id              String   @id @default(cuid())
  firstName       String
  lastName        String
  email           String   @unique
  
  // Encrypted phone fields
  phone           String?  @db.Text  // Encrypted data
  phoneIv         String?           // IV
  phoneAuthTag    String?           // Auth tag
  
  // Encrypted security answer
  securityAnswer  String?  @db.Text
  securityAnswerIv String?
  securityAnswerAuthTag String?
  
  // Encrypted guarantor info
  guarantorPhone  String?  @db.Text
  guarantorPhoneIv String?
  guarantorPhoneAuthTag String?
}
```

### Step 2: Run Migration

```bash
npx prisma migrate dev --name add_encryption_fields
```

### Step 3: Update Controller

**File**: `backend/src/controllers/userController.js`

```javascript
const { encryptPII, decryptPII } = require('../config/security');

// When saving user
async function updateProfile(req, res) {
  const { phone, securityAnswer } = req.body;
  
  let updateData = {
    firstName: req.body.firstName,
    // ... other fields
  };

  // Encrypt sensitive fields
  if (phone) {
    const encrypted = encryptPII(phone);
    updateData.phone = encrypted.encryptedData;
    updateData.phoneIv = encrypted.iv;
    updateData.phoneAuthTag = encrypted.authTag;
  }

  if (securityAnswer) {
    const encrypted = encryptPII(securityAnswer);
    updateData.securityAnswer = encrypted.encryptedData;
    updateData.securityAnswerIv = encrypted.iv;
    updateData.securityAnswerAuthTag = encrypted.authTag;
  }

  const user = await prisma.jobSeeker.update({
    where: { id: req.user.id },
    data: updateData
  });

  res.json({ success: true, user });
}

// When retrieving user
async function getProfile(req, res) {
  const user = await prisma.jobSeeker.findUnique({
    where: { id: req.user.id }
  });

  // Decrypt PII for API response (only in memory, not stored)
  if (user.phone && user.phoneIv && user.phoneAuthTag) {
    user.phone = decryptPII({
      encryptedData: user.phone,
      iv: user.phoneIv,
      authTag: user.phoneAuthTag
    });
  }

  res.json(user);
}
```

**Tests**:
- ✅ Raw DB: phone is encrypted (not readable)
- ✅ API response: phone is decrypted (readable)
- ✅ Verify IV/AuthTag present in DB
- ✅ Decryption fails without correct ENCRYPTION_KEY

---

## 🔍 TASK 6: Generate SEO Files (15 min)

```bash
# Run script
npm run generate-seo

# Verify files created
ls -la public/
# - robots.txt
# - sitemap.xml
# - metadata.json
# - schema-app.json
# - schema-org.json

# Test accessibility
curl https://edwl.io/robots.txt
curl https://edwl.io/sitemap.xml
```

---

## ✅ VERIFICATION CHECKLIST

Before committing changes:

```bash
# 1. Test all features
npm test

# 2. Run security scan
npm run security:scan

# 3. Check for errors
npm run lint

# 4. Build frontend
npm run build --prefix frontend

# 5. Start locally and test
npm run dev

# 6. Verify in browser
# - Try weak password → Should fail ✅
# - Try POST without CSRF → Should fail ✅
# - Login, wait 16 minutes → Should get TOKEN_EXPIRED ✅
# - Try 11 logins in 1 hour → Should get rate limited ✅
# - Upload file > 10MB → Should fail ✅
```

---

## 📊 PROGRESS TRACKING

Use this to track your work:

- [ ] Task 1: Password validation (30 min)
- [ ] Task 2: CSRF protection (30 min)
- [ ] Task 3: JWT expiry (1 hour)
- [ ] Task 4: Rate limiting (1.5 hours)
- [ ] Task 5: PII encryption (2 hours)
- [ ] Task 6: SEO files (15 min)
- [ ] All tests passing
- [ ] Code review
- [ ] Deploy to staging
- [ ] Deploy to production

---

## 🆘 COMMON ISSUES

### Issue: "Module not found: security.js"
**Solution**: Make sure you created the file at `backend/src/config/security.js`

### Issue: "JWT token still valid after 15 minutes"
**Solution**: Check JWT_CONFIG.accessTokenExpiry in security.js - should be '15m'

### Issue: "CSRF token always invalid"
**Solution**: 
1. Check session middleware is before CSRF middleware
2. Verify X-CSRF-Token header is being sent
3. Check CSRF token is in session

### Issue: "PII encryption not working"
**Solution**:
1. Verify ENCRYPTION_KEY env variable is set
2. Check for IV/AuthTag fields in schema
3. Ensure migrations ran: `npx prisma migrate deploy`

---

## 📞 GET HELP

1. Check `SECURITY_AUDIT_FIXES.md` for details
2. Check `API_DOCUMENTATION.md` for API changes
3. Review code examples in created modules
4. Ask on team Slack #security channel

---

## 🎯 Next Steps After This Week

**Week 2**:
- API versioning
- Email verification
- Audit logging

**Week 3-4**:
- Frontend SEO optimization
- Performance improvements
- GDPR compliance

---

**Status**: 🟢 Ready to implement  
**Estimated Time**: 5 hours  
**Difficulty**: Moderate  
**Help Available**: Yes - Check created modules for code examples

Let's make EDWL secure and discoverable! 🚀
