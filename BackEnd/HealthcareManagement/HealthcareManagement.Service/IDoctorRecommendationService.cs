using HealthcareManagement.Domain.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HealthcareManagement.Service
{
    public interface IDoctorRecommendationService
    {
        Task<List<Doctor>> GetRecommendedDoctorsAsync(string symptoms);
    }
}

