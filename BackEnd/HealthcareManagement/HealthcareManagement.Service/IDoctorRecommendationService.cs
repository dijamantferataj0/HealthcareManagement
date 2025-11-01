using System.Collections.Generic;
using System.Threading.Tasks;
using HealthcareManagement.Service.DTOs;

namespace HealthcareManagement.Service
{
    public interface IDoctorRecommendationService
    {
        Task<List<DoctorDto>> GetRecommendedDoctorsAsync(string symptoms);
    }
}

