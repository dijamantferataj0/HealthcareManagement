using MediatR;
using HealthcareManagement.Service;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

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
            var serviceDtos = await _doctorService.GetAllDoctorsAsync();
            // Map Service DTOs to Feature DTOs
            return serviceDtos.Select(d => new DoctorDto
            {
                Id = d.Id,
                Name = d.Name,
                Specializations = d.Specializations,
                Specialization = d.Specialization
            }).ToList();
        }
    }
}
