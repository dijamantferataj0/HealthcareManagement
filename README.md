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

- .NET 9 SDK
- Node.js 18+ and npm/yarn
- PostgreSQL (or update connection string for SQLite)
- Docker (optional, for containerization)
- OpenAI API key (optional, for AI recommendations)

## Backend Setup

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

## Docker Setup (Optional)

### Backend

1. **Build the Docker image:**
   ```bash
   cd BackEnd/HealthcareManagement/HealthcareManagement
   docker build -t healthcare-api .
   ```

2. **Run the container:**
   ```bash
   docker run -p 8080:8080 -p 8081:8081 \
     -e ConnectionStrings__DefaultConnection="Host=host.docker.internal;Port=5432;Database=healthcare_db;Username=user;Password=pass" \
     healthcare-api
   ```

### Docker Compose (Coming Soon)

A `docker-compose.yml` file can be added to orchestrate both backend and database services.

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

