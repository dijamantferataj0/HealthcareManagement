using System.Collections.Generic;
using System.Threading.Tasks;
using HealthcareManagement.Service.DTOs;

namespace HealthcareManagement.Service
{
    public interface IDoctorService
    {
        Task<List<DoctorDto>> GetAllDoctorsAsync();
    }
}
