# 🐾 Pet Directory API

[![Node.js CI](https://github.com/Benover75/pet-directory/actions/workflows/ci.yml/badge.svg)](https://github.com/Benover75/pet-directory/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/Benover75/pet-directory/branch/main/graph/badge.svg)](https://codecov.io/gh/Benover75/pet-directory)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docker Pulls](https://img.shields.io/docker/pulls/benover75/pet-directory)](https://hub.docker.com/r/benover75/pet-directory)
[![GitHub release](https://img.shields.io/github/v/release/Benover75/pet-directory)](https://github.com/Benover75/pet-directory/releases)
[![OpenAPI Validator](https://validator.swagger.io/validator?url=https://pet-directory-api.onrender.com/api-docs/openapi.json)](https://pet-directory-api.onrender.com/api-docs/)

## 🚀 Overview

Pet Directory is a production-ready RESTful API service built with Node.js, Express, and PostgreSQL. It provides a robust platform for discovering, reviewing, and managing pet-related businesses and services.

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with refresh tokens
- Role-based access control (Admin, Business Owner, User)
- Secure password hashing with bcrypt
- Rate limiting and request validation
- CORS and security headers

### 🏢 Business Management
- CRUD operations for pet businesses
- Service listings with categories and tags
- Business reviews and ratings system
- Advanced search with filtering and geolocation
- Business hours and holiday scheduling

### 🐾 Pet Profiles
- Pet registration and management
- Medical records and vaccination tracking
- Service history and appointment scheduling
- Pet preferences and special needs

### ⚡ Performance & Reliability
- Redis caching layer for frequently accessed data
- Optimized database queries with indexing
- Connection pooling and transaction management
- Containerized with Docker for consistent environments
- Comprehensive monitoring and logging

## 🛠 Technology Stack

### Core Technologies
- **Runtime**: Node.js 20 LTS
- **Framework**: Express 5.x
- **API Documentation**: OpenAPI 3.0 (Swagger)
- **Containerization**: Docker, Docker Compose

### Data Layer
- **Database**: PostgreSQL 15
- **ORM**: Sequelize 7.x
- **Caching**: Redis 7.x
- **Search**: PostgreSQL Full-Text Search
- **File Storage**: Local filesystem with S3 adapter

### Development Tools
- **Testing**: Jest, Supertest, Cypress
- **Linting**: ESLint with Airbnb config
- **Formatting**: Prettier
- **CI/CD**: GitHub Actions
- **Code Quality**: SonarQube integration

### Monitoring & Operations
- **Logging**: Winston with rotating files
- **Metrics**: Prometheus endpoint
- **API Monitoring**: Health checks
- **Error Tracking**: Sentry integration

## 📚 Documentation

- [API Documentation](https://pet-directory-api.onrender.com/api-docs/)
- [Project Status](./docs/project-status.md)
- [API Reference](./docs/API_DOCS.md)

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x
- PostgreSQL 15+
- Redis 7.x
- Docker (optional)

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/Benover75/pet-directory.git
   cd pet-directory
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Update the .env file with your configuration
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Docker Setup

```bash
# Build and start containers
docker-compose up -d --build

# Run migrations
npm run db:migrate

# Seed the database (optional)
npm run db:seed
```

## 🧪 Testing

Run the test suite:

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All tests with coverage
npm run test:coverage
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- All the amazing open-source projects that made this possible
- The pet-loving community for their support and feedback
