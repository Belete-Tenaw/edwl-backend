# EDWL API Documentation (v1.0)

**Base URL**: `https://api.edwl.io/api/v1`  
**Version**: 1.0.0  
**Last Updated**: 2026-06-26

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Rate Limiting](#rate-limiting)
3. [Response Format](#response-format)
4. [Errors](#errors)
5. [Endpoints](#endpoints)
   - [Auth](#auth-endpoints)
   - [Users](#user-endpoints)
   - [Jobs](#job-endpoints)
   - [Messaging](#messaging-endpoints)
   - [Payments](#payment-endpoints)
   - [Admin](#admin-endpoints)

---

## 🔐 Authentication

### Token-Based Authentication

All protected endpoints require an `Authorization` header with a Bearer token:

```bash
Authorization: Bearer <access_token>
```

### Get Access Token

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 900,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "JobSeeker|Employer|Admin",
    "tier": "FREEMIUM|SUBSCRIBER"
  }
}
```

### Refresh Token

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## 📊 Rate Limiting

Rate limits vary by endpoint and user tier:

| Tier | Auth | API | Upload | Message |
|------|------|-----|--------|---------|
| Anonymous | 10/hr | 100/15min | - | - |
| Freemium | - | 150/15min | 20/hr | 5/hr |
| Subscriber | - | 300/15min | 50/hr | 100/hr |

**Rate Limit Headers**:
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1234567890
```

**When Exceeded** (429 Too Many Requests):
```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_API",
  "retryAfter": 1234567890
}
```

---

## 📦 Response Format

### Success Response

```json
{
  "success": true,
  "data": { /* resource data */ },
  "message": "Operation successful"
}
```

### List Response

```json
{
  "success": true,
  "data": [ /* resources */ ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## ⚠️ Errors

### Error Response Format

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": { /* additional context */ },
  "timestamp": "2026-06-26T12:00:00Z"
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## 🔌 Endpoints

### AUTH Endpoints

#### Register

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+251912345678",
  "role": "JobSeeker|Employer",
  "acceptTerms": true
}
```

**Response**: 201 Created
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "role": "JobSeeker",
    "message": "Registration successful. Please verify your email."
  }
}
```

#### Verify Email

```http
POST /api/v1/auth/verify-email
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

#### Login

```http
POST /api/v1/auth/login
Content-Type: application/json
X-CSRF-Token: <token>

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

#### Logout

```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
X-CSRF-Token: <token>
```

#### Password Reset

```http
POST /api/v1/auth/password-reset
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Confirm Password Reset

```http
POST /api/v1/auth/password-reset/confirm
Content-Type: application/json

{
  "email": "user@example.com",
  "token": "reset-token",
  "newPassword": "NewPassword123!"
}
```

---

### USER Endpoints

#### Get Profile

```http
GET /api/v1/users/profile
Authorization: Bearer <token>
```

#### Update Profile

```http
PUT /api/v1/users/profile
Authorization: Bearer <token>
X-CSRF-Token: <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Experienced nanny...",
  "phone": "+251912345678",
  "skills": ["childcare", "cooking"],
  "availability": "full-time"
}
```

#### Upload Avatar

```http
POST /api/v1/users/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: (image file)
```

#### Get Public Profile

```http
GET /api/v1/users/{userId}/public
```

---

### JOB Endpoints

#### Create Job Post

```http
POST /api/v1/jobs
Authorization: Bearer <token>
X-CSRF-Token: <token>
Content-Type: application/json

{
  "title": "Housekeeper Needed",
  "description": "Looking for experienced housekeeper...",
  "jobType": "Full-time",
  "location": "Addis Ababa",
  "salary": 5000,
  "skills": ["cleaning", "cooking"],
  "requirements": "Must have 2+ years experience"
}
```

#### Get Jobs

```http
GET /api/v1/jobs?page=1&limit=20&jobType=Full-time&location=Addis%20Ababa&salary_min=3000&salary_max=10000
```

#### Get Job Details

```http
GET /api/v1/jobs/{jobId}
```

#### Update Job

```http
PUT /api/v1/jobs/{jobId}
Authorization: Bearer <token>
X-CSRF-Token: <token>
Content-Type: application/json

{
  "title": "Updated title",
  "status": "open|closed"
}
```

#### Delete Job

```http
DELETE /api/v1/jobs/{jobId}
Authorization: Bearer <token>
X-CSRF-Token: <token>
```

#### Apply for Job

```http
POST /api/v1/jobs/{jobId}/apply
Authorization: Bearer <token>
X-CSRF-Token: <token>
Content-Type: application/json

{
  "coverLetter": "I'm interested in this position..."
}
```

---

### MESSAGING Endpoints

#### Send Message

```http
POST /api/v1/messages
Authorization: Bearer <token>
X-CSRF-Token: <token>
Content-Type: application/json

{
  "recipientId": "uuid",
  "subject": "Job Inquiry",
  "message": "I'm interested in your job post...",
  "contextId": "job-uuid"  // Optional: link to job/contract
}
```

#### Get Conversations

```http
GET /api/v1/messages/conversations?page=1&limit=20
Authorization: Bearer <token>
```

#### Get Messages

```http
GET /api/v1/messages/{conversationId}?page=1&limit=50
Authorization: Bearer <token>
```

#### Mark as Read

```http
PUT /api/v1/messages/{messageId}/read
Authorization: Bearer <token>
X-CSRF-Token: <token>
```

---

### PAYMENT Endpoints

#### Get Subscription Tiers

```http
GET /api/v1/payments/tiers
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "freemium",
      "name": "Freemium",
      "price": 0,
      "features": ["5 views/day", "Limited messaging"]
    },
    {
      "id": "subscriber",
      "name": "Subscriber",
      "price": 99,
      "features": ["Unlimited views", "Unlimited messaging", "Priority support"]
    }
  ]
}
```

#### Create Subscription

```http
POST /api/v1/payments/subscribe
Authorization: Bearer <token>
X-CSRF-Token: <token>
Content-Type: application/json

{
  "tier": "subscriber",
  "subscriptionCode": "ABC123DEF456"  // For code-based activation
}
```

#### Get Payment History

```http
GET /api/v1/payments/history?page=1&limit=20
Authorization: Bearer <token>
```

#### Refund Payment

```http
POST /api/v1/payments/{paymentId}/refund
Authorization: Bearer <token> (Admin only)
X-CSRF-Token: <token>
Content-Type: application/json

{
  "reason": "Requested by user"
}
```

---

### ADMIN Endpoints

#### Get Users

```http
GET /api/v1/admin/users?page=1&limit=50&role=JobSeeker&status=pending
Authorization: Bearer <token> (Admin only)
```

#### Approve User

```http
PUT /api/v1/admin/users/{userId}/approve
Authorization: Bearer <token> (Admin only)
X-CSRF-Token: <token>
Content-Type: application/json

{
  "status": "approved|rejected",
  "notes": "ID verified successfully"
}
```

#### Suspend User

```http
PUT /api/v1/admin/users/{userId}/suspend
Authorization: Bearer <token> (Admin only)
X-CSRF-Token: <token>
Content-Type: application/json

{
  "reason": "Violation of terms",
  "duration": 30  // days
}
```

#### Get Reports

```http
GET /api/v1/admin/reports?status=open&category=harassment&page=1
Authorization: Bearer <token> (Admin only)
```

#### Resolve Dispute

```http
PUT /api/v1/admin/disputes/{disputeId}/resolve
Authorization: Bearer <token> (Admin only)
X-CSRF-Token: <token>
Content-Type: application/json

{
  "resolution": "approved|rejected|partial_refund",
  "notes": "Evidence reviewed...",
  "refundAmount": 1000
}
```

---

## 🚀 Webhooks

### Payment Webhook

```http
POST /webhooks/payments
Content-Type: application/json
X-Webhook-Signature: sha256=...

{
  "event": "payment.completed|payment.failed|payment.refunded",
  "data": {
    "paymentId": "uuid",
    "userId": "uuid",
    "amount": 5000,
    "status": "completed",
    "timestamp": "2026-06-26T12:00:00Z"
  }
}
```

---

## 📱 SDK Examples

### JavaScript/Node.js

```javascript
const EDWL = require('edwl-sdk');

const client = new EDWL.Client({
  apiKey: 'your-api-key',
  baseURL: 'https://api.edwl.io/api/v1'
});

// Register
const user = await client.auth.register({
  email: 'user@example.com',
  password: 'SecurePassword123!',
  role: 'JobSeeker'
});

// Get jobs
const jobs = await client.jobs.list({
  page: 1,
  limit: 20
});

// Apply for job
await client.jobs.apply(jobId, {
  coverLetter: 'I\'m interested...'
});
```

---

## 🔄 Versioning

EDWL API uses semantic versioning:
- **v1.0**: Initial release (current)
- **v2.0**: Planned (breaking changes)

Old versions are deprecated 12 months after release.

---

**Last Updated**: 2026-06-26  
**API Status**: ✅ Production Ready
