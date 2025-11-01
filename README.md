# Healthcare Appointment Management System

A full-stack Healthcare Appointment Management System built with .NET 9 (backend) and Next.js (frontend), featuring JWT authentication, AI-powered doctor recommendations, and comprehensive appointment management.

## Features

### Backend (.NET 9)
- ✅ RESTful API for managing doctors, patients, and appointments
- ✅ JWT-based authentication and authorization
- ✅ Entity Framework Core with PostgreSQL
- ✅ Automatic database migrations on startup
- ✅ Swagger API documentation
- ✅ Soft delete functionality
- ✅ Appointment status management (Active, Finished, Canceled)
- ✅ AI-powered doctor recommendation (OpenAI integration)
- ✅ Docker support

### Frontend (Next.js)
- ✅ Patient registration and login
- ✅ View appointments with date, time, doctor, and status
- ✅ Book appointments with doctor selection and date/time
- ✅ AI-powered doctor recommendation based on symptoms
- ✅ Edit appointments (change date/time)
- ✅ Cancel appointments (soft delete with status update)
- ✅ Responsive design with TailwindCSS
- ✅ JWT-based authentication

## Project Structure

```
HealtcareManagement/
├── BackEnd/
│   └── HealthcareManagement/
│       ├── HealthcareManagement/          # API Layer (Controllers, Features)
│       ├── HealthcareManagement.Domain/   # Domain Models
│       ├── HealthcareManagement.Persistence/ # EF Core, Repository Pattern
│       └── HealthcareManagement.Service/  # Business Logic
└── FrontEnd/
    └── healthcare-management/             # Next.js Application
```

## Prerequisites

### Option 1: Docker (Recommended - Easiest Way)
- Docker Desktop (or Docker Engine + Docker Compose)
- OpenAI API key (optional, for AI recommendations)

### Option 2: Manual Setup
- .NET 9 SDK
- Node.js 18+ and npm/yarn
- PostgreSQL (or update connection string for SQLite)
- OpenAI API key (optional, for AI recommendations)

## Manual Setup (Without Docker)

If you prefer to run the services manually without Docker:

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd BackEnd/HealthcareManagement
   ```

2. **Configure database connection:**
   
   Edit `HealthcareManagement/appsettings.Development.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Port=5432;Database=healthcare_db;Username=your_user;Password=your_password"
     }
   }
   ```
   
   Or update for SQLite if preferred:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Data Source=healthcare.db"
     }
   }
   ```

3. **Configure OpenAI (Optional):**
   
   Edit `HealthcareManagement/appsettings.Development.json`:
   ```json
   {
     "OpenAI": {
       "ApiKey": "your-openai-api-key",
       "Model": "gpt-4o-mini"
     }
   }
   ```
   
   If no API key is provided, the system falls back to rule-based recommendations.

4. **Run the application:**
   ```bash
   cd HealthcareManagement
   dotnet restore
   dotnet run
   ```
   
   The API will be available at:
   - HTTP: `http://localhost:5273`
   - HTTPS: `https://localhost:7067`
   - Swagger: `https://localhost:7067/swagger`

5. **Database migrations:**
   
   Migrations are automatically applied on startup. If you need to create a new migration:
   ```bash
   dotnet ef migrations add YourMigrationName --project ../HealthcareManagement.Persistence --startup-project .
   ```

## Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd FrontEnd/healthcare-management
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure API URL:**
   
   Create `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5273
   ```
   
   For HTTPS:
   ```env
   NEXT_PUBLIC_API_URL=https://localhost:7067
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   
   The application will be available at `http://localhost:3000`

---

## Which Setup Should I Use?

- **Use Docker** if you want the easiest setup and don't want to install .NET SDK, Node.js, or PostgreSQL locally
- **Use Manual Setup** if you prefer to run services individually, want to develop/debug locally, or don't have Docker installed

Both methods provide the same functionality!

## Docker Setup (Recommended - Easiest Way to Run)

The easiest way to run the entire project is using Docker Compose. It will set up PostgreSQL, backend API, and frontend automatically.

### Quick Start with Docker

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd HealthcareManagement
   ```

2. **Create environment file (optional):**
   
   Create a `.env` file in the root directory to customize configuration:
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

   # JWT Configuration (optional, defaults are provided)
   JWT_KEY=your-secret-key-here
   JWT_ISSUER=HealthcareApi
   JWT_AUDIENCE=HealthcareApiUsers
   JWT_EXPIRATION_HOURS=24

   # OpenAI Configuration (optional, for AI recommendations)
   OPENAI_API_KEY=your-openai-api-key
   OPENAI_MODEL=gpt-4o-mini
   ```
   
   If you don't create a `.env` file, Docker Compose will use sensible defaults.

3. **Start all services:**
   ```bash
   docker-compose up -d
   ```
   
   This will:
   - Download PostgreSQL image
   - Build and start the backend API
   - Build and start the frontend
   - Set up the database automatically

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - Swagger API Docs: http://localhost:8080/swagger
   - PostgreSQL: localhost:5432 (for external tools)

5. **View logs:**
   ```bash
   # All services
   docker-compose logs -f
   
   # Specific service
   docker-compose logs -f backend
   docker-compose logs -f frontend
   docker-compose logs -f postgres
   ```

6. **Stop all services:**
   ```bash
   docker-compose down
   ```

7. **Stop and remove volumes (clears database):**
   ```bash
   docker-compose down -v
   ```

### Docker Commands

```bash
# Build images
docker-compose build

# Start services in detached mode
docker-compose up -d

# Start services and view logs
docker-compose up

# Restart a specific service
docker-compose restart backend

# Stop services
docker-compose stop

# Remove containers and networks
docker-compose down

# Remove containers, networks, and volumes (clears database)
docker-compose down -v

# Rebuild and restart
docker-compose up -d --build
```

### First Run

On first run, the backend will automatically apply database migrations and seed initial doctor data. You can:

1. Register a new account at http://localhost:3000/register
2. Login and start booking appointments
3. Test the AI doctor recommendation feature

### Troubleshooting

- **Port already in use:** Change the port in `.env` file or stop the conflicting service
- **Database connection issues:** Ensure PostgreSQL container is healthy: `docker compose ps`
- **Frontend can't reach backend:** 
  - Ensure backend is running: `docker compose ps`
  - Check backend logs: `docker compose logs backend`
  - Verify CORS is configured correctly (should allow `http://localhost:3000`)
  - **If you changed `FRONTEND_API_URL` after initial build**, rebuild the frontend:
    ```bash
    docker compose build frontend
    docker compose up -d frontend
    ```
- **View backend logs:** `docker compose logs backend` to see API errors
- **View frontend logs:** `docker compose logs frontend`
- **Reset everything:** `docker compose down -v && docker compose up -d --build`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new patient
- `POST /api/auth/login` - Patient login (returns JWT)

### Doctors
- `GET /api/doctors` - Get all doctors
- `POST /api/doctors/recommend` - Get AI-recommended doctors based on symptoms

### Appointments
- `GET /api/appointments` - Get all appointments for logged-in patient
- `POST /api/appointments` - Book a new appointment
- `PUT /api/appointments/{id}` - Update appointment date/time
- `DELETE /api/appointments/{id}` - Cancel an appointment (soft delete)

## Default Seed Data

The database is pre-seeded with the following doctors:
- Dr. Alice Smith (Cardiology)
- Dr. Bob Wang (Dermatology)
- Dr. Carla Jones (Neurology)

## Frontend Pages

- `/login` - Patient login page
- `/register` - Patient registration page
- `/appointments` - View appointments and book new ones (modal)
- `/appointments/manage` - Manage and edit/cancel appointments

## Features Explained

### Soft Delete
All entities (Doctor, Patient, Appointment) have a `Deleted` boolean field. When deleted, records are marked as deleted rather than physically removed from the database. Global query filters automatically exclude deleted records.

### Appointment Status
Appointments have three statuses:
- **Active (1)** - Scheduled appointments
- **Finished (2)** - Completed appointments
- **Canceled (3)** - Cancelled appointments

When an appointment is cancelled via DELETE endpoint, its status is set to "Canceled" instead of being deleted.

### AI Doctor Recommendations
The system uses OpenAI's GPT model to analyze patient symptoms and recommend relevant doctors based on their specializations. If no OpenAI API key is configured, it falls back to rule-based keyword matching.

## Testing

### Backend
Access Swagger UI at `https://localhost:7067/swagger` for interactive API testing.

### Frontend
Run the development server and test the user flows:
1. Register a new account
2. Login
3. Book an appointment
4. Use AI recommendation feature
5. View and manage appointments

## Technologies Used

### Backend
- .NET 9
- ASP.NET Core Web API
- Entity Framework Core
- PostgreSQL (or SQLite)
- MediatR (CQRS pattern)
- JWT Authentication
- Swagger/OpenAPI

### Frontend
- Next.js (Latest stable)
- TypeScript
- React
- TailwindCSS
- Axios/Fetch API

## License

This project is part of an evaluation assignment.

## Notes

- Ensure PostgreSQL is running before starting the backend
- The OpenAI API key is optional but recommended for better doctor recommendations
- All API endpoints require JWT authentication except `/api/auth/register` and `/api/auth/login`
- CORS is configured for `http://localhost:3000` and `http://127.0.0.1:3000` in development

