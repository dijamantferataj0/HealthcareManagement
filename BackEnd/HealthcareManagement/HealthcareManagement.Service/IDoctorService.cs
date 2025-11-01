using System.Collections.Generic;
using System.Threading.Tasks;
using HealthcareManagement.Domain.Models;

namespace HealthcareManagement.Service
{
    public interface IDoctorService
    {
        Task<List<Doctor>> GetAllDoctorsAsync();
    }
}
