using MediatR;
using HealthcareManagement.Domain.Models;
using HealthcareManagement.Service;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;

namespace HealthcareManagement.Features.Doctors.Handlers
{
    public class GetDoctorsQueryHandler : IRequestHandler<Queries.GetDoctorsQuery, List<DoctorDto>>
    {
        private readonly IDoctorService _doctorService;
        public GetDoctorsQueryHandler(IDoctorService doctorService)
        {
            _doctorService = doctorService;
        }
        public async Task<List<DoctorDto>> Handle(Queries.GetDoctorsQuery request, CancellationToken cancellationToken)
        {
            var list = await _doctorService.GetAllDoctorsAsync();
            return list.Select(d => new DoctorDto { Id = d.Id, Name = d.Name, Specialization = d.Specialization }).ToList();
        }
    }
}
