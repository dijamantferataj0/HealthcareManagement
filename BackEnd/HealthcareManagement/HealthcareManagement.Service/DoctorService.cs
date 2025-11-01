using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HealthcareManagement.Domain.Models;
using HealthcareManagement.Persistence;
using HealthcareManagement.Service.DTOs;
using Microsoft.EntityFrameworkCore;

namespace HealthcareManagement.Service
{
    public class DoctorService : IDoctorService
    {
        private readonly HealthcareDbContext _context;
        public DoctorService(HealthcareDbContext context)
        {
            _context = context;
        }
        public async Task<List<DoctorDto>> GetAllDoctorsAsync()
        {
            var doctors = await _context.Doctors
                .Include(d => d.DoctorSpecializations)
                    .ThenInclude(ds => ds.Specialization)
                .ToListAsync();

            return doctors.Select(d => new DoctorDto
            {
                Id = d.Id,
                Name = d.Name,
                Specializations = d.DoctorSpecializations?.Select(ds => ds.Specialization.Name).ToList() ?? new List<string>(),
                Specialization = string.Join(", ", d.DoctorSpecializations?.Select(ds => ds.Specialization.Name) ?? Enumerable.Empty<string>())
            }).ToList();
        }
    }
}
