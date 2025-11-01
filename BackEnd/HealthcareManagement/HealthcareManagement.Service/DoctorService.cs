using System.Collections.Generic;
using System.Threading.Tasks;
using HealthcareManagement.Domain.Models;
using HealthcareManagement.Persistence;

namespace HealthcareManagement.Service
{
    public class DoctorService : IDoctorService
    {
        private readonly IUnitOfWork _unitOfWork;
        public DoctorService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<List<Doctor>> GetAllDoctorsAsync()
        {
            var list = await _unitOfWork.Doctors.GetAllAsync();
            return list.ToList();
        }
    }
}
