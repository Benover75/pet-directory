# 📚 Pet Directory API Documentation

<div align="center">
  <p>
    <strong>Version:</strong> 2.0.0 | 
    <strong>Environment:</strong> Production | 
    <strong>Updated:</strong> 2025-09-05
  </p>
  
  [![API Status](https://img.shields.io/website?down_message=offline&label=status&up_message=online&url=https%3A%2F%2Fpet-directory-api.onrender.com%2Fhealth)](https://pet-directory-api.onrender.com/health)
  [![OpenAPI Validator](https://validator.swagger.io/validator?url=https://pet-directory-api.onrender.com/api-docs/openapi.json)](https://pet-directory-api.onrender.com/api-docs/)
  [![GitHub release](https://img.shields.io/github/v/release/Benover75/pet-directory)](https://github.com/Benover75/pet-directory/releases)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Coverage Status](https://coveralls.io/repos/github/Benover75/pet-directory/badge.svg?branch=main)](https://coveralls.io/github/Benover75/pet-directory?branch=main)
</div>

## 📋 Overview

The Pet Directory API provides a comprehensive set of RESTful endpoints to manage pet-related businesses, services, reviews, and user interactions. This documentation provides detailed information about available API endpoints, request/response formats, and authentication requirements.

### Base URLs
- **Production**: `https://api.petdirectory.com/api/v1`
- **Staging**: `https://staging.api.petdirectory.com/api/v1`
- **Local Development**: `http://localhost:5000/api/v1`

### Rate Limits
- **Public API**: 100 requests per minute per IP
- **Authenticated API**: 1,000 requests per minute per token
- **Partner API**: 10,000 requests per minute per API key

## 📖 Table of Contents

- [🌐 API Overview](#-api-overview)
- [🔐 Authentication](#-authentication)
- [🚦 Error Handling](#-error-handling)
- [📊 Response Format](#-response-format)
- [🔍 Endpoints](#-endpoints)
  - [🔑 Authentication](#-authentication-endpoints)
  - [🏢 Businesses](#-business-endpoints)
  - [🛠 Services](#-service-endpoints)
  - [⭐ Reviews](#-review-endpoints)
  - [🐾 Pets](#-pet-endpoints)
  - [👤 Users](#-user-endpoints)
- [🔢 Pagination](#-pagination)
- [🔍 Filtering & Search](#-filtering--search)
- [⚙️ Validation](#️-validation)
- [⚖️ Rate Limiting](#️-rate-limiting)
- [🔒 Security](#-security)

## 🌐 API Overview

The Pet Directory API provides a comprehensive set of endpoints to manage all aspects of pet-related businesses, services, and user interactions. This RESTful API follows standard conventions and returns JSON responses.

### Base URL

```
http://localhost:5000/api/v1
```

### Available Formats

- **JSON**: All endpoints accept and return JSON by default
- **Form Data**: Some endpoints accept form data for file uploads

## 🔐 Authentication

### Authentication Methods

1. **JWT (JSON Web Token)**
   - Required for all authenticated endpoints
   - Token must be included in the `Authorization` header
   - Token expiration: 24 hours (refresh token available)

### Obtaining a Token

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-secure-password"
}
```

### Using the Token

Include the JWT token in the `Authorization` header for all authenticated requests:

```http
GET /api/v1/businesses
Authorization: Bearer your.jwt.token.here
```

## 🚦 Error Handling

### Standard Error Response Format

```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": {
    "field": "Additional error details"
  },
  "code": "ERROR_CODE",
  "timestamp": "2025-09-03T10:00:00Z"
}
```

### HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 OK | Request succeeded |
| 201 Created | Resource created successfully |
| 204 No Content | Action completed successfully, no content to return |
| 400 Bad Request | Invalid request format or parameters |
| 401 Unauthorized | Authentication required or failed |
| 403 Forbidden | Insufficient permissions |
| 404 Not Found | Resource not found |
| 409 Conflict | Resource conflict (e.g., duplicate entry) |
| 422 Unprocessable Entity | Validation failed |
| 429 Too Many Requests | Rate limit exceeded |
| 500 Internal Server Error | Server error |
| 503 Service Unavailable | Service temporarily unavailable |

## 📊 Response Format

### Success Response

```json
{
  "data": {
    // Request-specific data
  },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  },
  "links": {
    "self": "/api/v1/businesses?page=1",
    "next": "/api/v1/businesses?page=2",
    "prev": null,
    "last": "/api/v1/businesses?page=10"
  }
}
```

### Error Response

```json
{
  "error": "ValidationError",
  "message": "Invalid input data",
  "details": {
    "name": "Name is required",
    "email": "Invalid email format"
  },
  "code": "VALIDATION_ERROR",
  "timestamp": "2025-09-03T10:00:00Z"
}
```

## ⚖️ Rate Limiting

API requests are subject to rate limiting to ensure fair usage and prevent abuse.

### Rate Limits

| Scope | Limit | Window |
|-------|-------|--------|
| IP Address | 100 requests | 15 minutes |
| Authenticated User | 1,000 requests | 24 hours |
| Authentication Endpoints | 10 requests | 1 hour |

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1660000000
Retry-After: 60
```

## 🔒 Security

### Authentication

- JWT-based authentication
- Secure token storage in HTTP-only cookies
- Refresh token rotation
- Token blacklisting

### Data Protection

- All data encrypted in transit (HTTPS)
- Sensitive data encrypted at rest
- Input validation and sanitization
- Protection against common web vulnerabilities (XSS, CSRF, SQL Injection)

### Best Practices

1. Always use HTTPS
2. Never expose API keys or tokens in client-side code
3. Implement proper error handling
4. Follow the principle of least privilege
5. Keep dependencies updated

## 🔍 Endpoints

### 🔑 Authentication

#### Login

```http
POST /auth/login
```

**Request Body**

```json
{
  "email": "user@example.com",
  "password": "your-secure-password"
}
```

**Response**

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com",
      "role": "user"
    }
  }
}
```

#### Refresh Token

```http
POST /auth/refresh-token
```

**Request Body**

```json
{
  "refreshToken": "your-refresh-token"
}
```

### 🏢 Businesses

#### List Businesses

```http
GET /businesses
```

**Query Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Items per page (default: 10, max: 100) |
| `q` | string | Search query |
| `category` | string | Filter by category |
| `location` | string | Filter by location |
| `sort` | string | Sort field (e.g., `rating`, `-createdAt`) |

**Response**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Happy Paws Grooming",
      "description": "Professional pet grooming services",
      "category": "Grooming",
      "address": "123 Pet St, Anytown, USA",
      "phone": "+1234567890",
      "email": "info@happypaws.com",
      "website": "https://happypaws.com",
      "rating": 4.8,
      "reviewCount": 124,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-09-01T12:00:00.000Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  },
  "links": {
    "self": "/api/v1/businesses?page=1",
    "next": "/api/v1/businesses?page=2",
    "prev": null,
    "last": "/api/v1/businesses?page=5"
  }
}
```

#### Get Business by ID

```http
GET /businesses/:id
```

**Response**

```json
{
  "data": {
    "id": 1,
    "name": "Happy Paws Grooming",
    "description": "Professional pet grooming services",
    "category": "Grooming",
    "address": "123 Pet St, Anytown, USA",
    "phone": "+1234567890",
    "email": "info@happypaws.com",
    "website": "https://happypaws.com",
    "rating": 4.8,
    "reviewCount": 124,
    "services": [
      {
        "id": 1,
        "name": "Full Grooming Package",
        "description": "Bath, haircut, nail trim, and ear cleaning",
        "price": 60.00,
        "duration": 120
      }
    ],
    "reviews": [
      {
        "id": 1,
        "rating": 5,
        "comment": "Amazing service! My dog looks fantastic!",
        "user": {
          "id": 1,
          "name": "Jane Smith"
        },
        "createdAt": "2025-08-15T14:30:00.000Z"
      }
    ],
    "businessHours": [
      {
        "day": "monday",
        "open": "09:00",
        "close": "18:00",
        "isClosed": false
      }
    ],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-09-01T12:00:00.000Z"
  }
}
```

#### Create Business

```http
POST /businesses
Authorization: Bearer your.jwt.token.here
```

**Request Body**

```json
{
  "name": "New Pet Business",
  "description": "Description of the business",
  "category": "Veterinary",
  "address": "123 Business St, City, Country",
  "phone": "+1234567890",
  "email": "contact@business.com",
  "website": "https://business.com",
  "businessHours": [
    {
      "day": "monday",
      "open": "09:00",
      "close": "18:00",
      "isClosed": false
    }
  ]
}
```

## 🔢 Pagination

All list endpoints support pagination using the following query parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (1-based) |
| `limit` | integer | 10 | Items per page (max: 100) |
| `sort` | string | `-createdAt` | Sort field (prefix with `-` for descending) |

### Example

```
GET /api/v1/businesses?page=2&limit=20&sort=name
```

## 🔍 Filtering & Search

### Search Syntax

- Use the `q` parameter for full-text search
- Filter by specific fields using query parameters
- Combine multiple filters

### Examples

```
# Search for businesses with "pet" in name or description
GET /api/v1/businesses?q=pet

# Filter by category
GET /api/v1/businesses?category=Grooming&category=Veterinary

# Range queries
GET /api/v1/businesses?rating[gte]=4&reviewCount[gt]=10

# Date range
GET /api/v1/businesses?createdAt[gte]=2025-01-01&createdAt[lte]=2025-12-31
```

## ⚙️ Validation

### Request Validation

All API endpoints validate request data according to the following rules:

1. **Required Fields**: Marked as required in the API documentation
2. **Data Types**: Enforced for all fields
3. **Formats**: Email, URL, date, etc. formats are validated
4. **Custom Validators**: Business logic validation

### Validation Error Response

```json
{
  "error": "ValidationError",
  "message": "Validation failed",
  "details": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters long"
  },
  "code": "VALIDATION_ERROR"
}
```

## 📚 Additional Resources

- [API Changelog](CHANGELOG.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [License](LICENSE)

## 📬 Support

For support, please contact [support@petdirectory.com](mailto:support@petdirectory.com) or open an issue in our [GitHub repository](https://github.com/yourusername/pet-directory/issues).

---

<div align="center">
  <p>© 2025 Pet Directory. All rights reserved.</p>
</div>

## 🔄 Response Format

All responses follow this format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

## 📄 Pagination

List endpoints support pagination using `page` and `limit` query parameters:

```
GET /api/v1/businesses?page=1&limit=10
```

## 🔍 Filtering & Search

Most list endpoints support filtering and search:

```
GET /api/v1/businesses?search=pet&category=grooming
```

## ✅ Validation

All endpoints validate input data. Invalid requests will return 400 status with error details.

---

## 🔐 Authentication Endpoints

### Register a New User

```http
POST /auth/register
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

### Login

```http
POST /auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

## 🏢 Business Endpoints

### Create Business

```http
POST /businesses
```

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "name": "Paws & Claws",
  "description": "Premium pet grooming services",
  "address": "123 Pet St, Pet City",
  "phone": "+1234567890",
  "email": "contact@pawsandclaws.com"
}
```

### Get All Businesses

```http
GET /businesses?page=1&limit=10&search=paws
```

## 🛠 Service Endpoints

### Create Service

```http
POST /services
```

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "businessId": 1,
  "name": "Full Grooming",
  "description": "Complete grooming service",
  "price": 50.00,
  "duration": 120
}
```

### Get Business Services

```http
GET /services/:businessId?page=1&limit=10
```

## ⭐ Review Endpoints

### Create Review

```http
POST /reviews
```

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "businessId": 1,
  "rating": 5,
  "comment": "Excellent service!"
}
```

### Get Business Reviews

```http
GET /reviews/:businessId?page=1&limit=10
```

### Delete Review

```http
DELETE /reviews/:reviewId
```

**Headers:**
- `Authorization: Bearer <token>`

```
http://localhost:5000/api/v1
```

> **Note**: Replace `localhost:5000` with your domain in production.
Content-Type: application/json
```

### Token Expiration
- Access tokens expire in 24 hours
- Refresh tokens expire in 7 days

## ⚡ Rate Limiting

- 100 requests per 15 minutes per IP address
- Rate limit headers are included in all responses
- Exceeding the limit results in a `429 Too Many Requests` response

## 🚨 Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [
      {
        "field": "field_name",
        "message": "Specific error message"
      }
    ]
  }
}
```

### Common Error Codes

| Status | Code | Description |
|--------|------|-------------|
| 400 | BAD_REQUEST | Invalid request format |
| 401 | UNAUTHORIZED | Missing or invalid authentication |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource conflict |
| 422 | VALIDATION_ERROR | Request validation failed |
| 429 | TOO_MANY_REQUESTS | Rate limit exceeded |
| 500 | INTERNAL_SERVER_ERROR | Server error |

## 📦 Data Models

### User
```typescript
{
  id: string;
  name: string;
  email: string;
  role: 'user' | 'business' | 'admin';
  createdAt: string;
  updatedAt: string;
}
```

### Business
```typescript
{
  id: string;
  name: string;
  type: 'Vet' | 'Groomer' | 'Pet Sitter' | 'Dog Park';
  address: string;
  latitude?: number;
  longitude?: number;
  contactInfo?: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
```

## 📝 Response Format

### Success Response
```json
{
  "data": {
    // Response data
  },
  "meta": {
    // Pagination info (if applicable)
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": [
      { "field": "fieldName", "message": "Error details" }
    ]
  }
}
```

## 🔄 Pagination

All list endpoints support pagination:

```
GET /api/v1/businesses?page=1&limit=10
```

### Query Parameters
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

## 🔍 Filtering & Sorting

### Filtering
```
GET /api/v1/businesses?type=Vet&rating[gte]=4
```

### Sorting
```
GET /api/v1/businesses?sort=name:asc,createdAt:desc
```

## 📋 Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```

**Request Body**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "user"
}
```

**Success Response (201)**
```json
{
  "token": "jwt.token.here",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Login
```http
POST /auth/login
```

**Request Body**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (200)**
```json
{
  "token": "jwt.token.here",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Businesses

#### List Businesses
```http
GET /businesses
```

**Query Parameters**
- `type` - Filter by business type
- `page` - Page number
- `limit` - Items per page
- `sort` - Sort field and direction (e.g., `name:asc`)

**Success Response (200)**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Paws & Claws Vet",
      "type": "Vet",
      "address": "123 Pet St",
      "rating": 4.5
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

#### Create Business
```http
POST /businesses
```

**Request Body**
```json
{
  "name": "Paws & Claws Vet",
  "type": "Vet",
  "address": "123 Pet St",
  "description": "Full-service veterinary clinic"
}
```

**Success Response (201)**
```json
{
  "id": "uuid",
  "name": "Paws & Claws Vet",
  "type": "Vet",
  "address": "123 Pet St",
  "description": "Full-service veterinary clinic",
  "userId": "user-uuid",
  "createdAt": "2025-08-31T10:00:00Z"
}
```

### Services

#### List Business Services
```http
GET /businesses/:businessId/services
```

**Success Response (200)**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Vaccination",
      "price": 50.00,
      "duration": 30,
      "businessId": "business-uuid"
    }
  ]
}
```

### Reviews

#### Create Review
```http
POST /reviews
```

**Request Body**
```json
{
  "businessId": "business-uuid",
  "rating": 5,
  "comment": "Great service!"
}
```

**Success Response (201)**
```json
{
  "id": "review-uuid",
  "rating": 5,
  "comment": "Great service!",
  "userId": "user-uuid",
  "businessId": "business-uuid",
  "createdAt": "2025-08-31T10:00:00Z"
}
```

## 🔐 Rate Limiting Headers

All responses include rate limit information:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1620000000
```
```

**Success Response (200):**

```json
{
  "token": "jwt.token.here",
  "expiresIn": 3600
}
```

### Businesses

#### Get All Businesses

```http
GET /businesses
```

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 10)
- `sort` (string, values: 'name', 'rating', 'createdAt')
- `order` (string, values: 'asc', 'desc')

**Success Response (200):**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "address": "string",
      "rating": 4.5,
      "reviewCount": 42
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

#### Create Business (Authenticated)

```http
POST /businesses
```

**Request Body:**

```json
{
  "name": "string (required)",
  "address": "string (required)",
  "phone": "string (required)",
  "email": "string (required, email)",
  "website": "string (optional, url)",
  "description": "string (optional)"
}
```

### Services

#### Get Services by Business

```http
GET /businesses/:businessId/services
```

**Success Response (200):**

```json
[
  {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "price": 29.99,
    "duration": 60
  }
]
```

### Reviews

#### Create Review (Authenticated)

```http
POST /businesses/:businessId/reviews
```

**Request Body:**

```json
{
  "rating": 5,
  "comment": "Great service!",
  "serviceId": "uuid (optional)"
}
```

## Error Responses

### 400 Bad Request

```json
{
  "error": "Validation Error",
  "message": "Detailed error message",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "No token provided"
}
```

### 403 Forbidden

```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found

```json
{
  "error": "Not Found",
  "message": "Business not found"
}
```

### 429 Too Many Requests

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again in 15 minutes.",
  "retryAfter": 900
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "requestId": "req_12345"
}
```

## Versioning

- Current API Version: 1.0.0
- Version is included in the URL path
- Breaking changes will result in a new version number

## Support

For support, please contact <support@petdirectory.com>
