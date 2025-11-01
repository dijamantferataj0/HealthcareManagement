# Docker Setup Guide

## Quick Start

1. **Create `.env` file** (optional, for customization):
   ```env
   # PostgreSQL Configuration
   POSTGRES_DB=healthcare_db
   POSTGRES_USER=healthcare_user
   POSTGRES_PASSWORD=healthcare_password
   POSTGRES_PORT=5432

   # Backend Configuration
   BACKEND_PORT=8080
   BACKEND_HTTPS_PORT=8081

   # Frontend Configuration
   FRONTEND_PORT=3000
   FRONTEND_API_URL=http://localhost:8080

   # JWT Configuration
   JWT_KEY=your-secret-key-here
   JWT_ISSUER=HealthcareApi
   JWT_AUDIENCE=HealthcareApiUsers
   JWT_EXPIRATION_HOURS=24

   # OpenAI Configuration (Optional)
   OPENAI_API_KEY=your-openai-api-key
   OPENAI_MODEL=gpt-4o-mini
   ```

2. **Start everything:**
   ```bash
   docker-compose up -d
   ```

3. **Access:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - Swagger: http://localhost:8080/swagger

See README.md for full documentation.

