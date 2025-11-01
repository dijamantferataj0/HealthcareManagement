# Multi-stage build for .NET 9 API
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ["HealthcareManagement/HealthcareManagement.csproj", "HealthcareManagement/"]
COPY ["HealthcareManagement.Service/HealthcareManagement.Service.csproj", "HealthcareManagement.Service/"]
COPY ["HealthcareManagement.Domain/HealthcareManagement.Domain.csproj", "HealthcareManagement.Domain/"]
COPY ["HealthcareManagement.Persistence/HealthcareManagement.Persistence.csproj", "HealthcareManagement.Persistence/"]

# Restore dependencies
RUN dotnet restore "HealthcareManagement/HealthcareManagement.csproj"

# Copy all source files
COPY . .

# Build and publish
WORKDIR "/src/HealthcareManagement"
RUN dotnet build "HealthcareManagement.csproj" -c Release -o /app/build
RUN dotnet publish "HealthcareManagement.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "HealthcareManagement.dll"]