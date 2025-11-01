using MediatR;
using System.Collections.Generic;

namespace HealthcareManagement.Features.Doctors.Queries
{
    public class GetDoctorsQuery : IRequest<List<DoctorDto>>
    {
    }
}
