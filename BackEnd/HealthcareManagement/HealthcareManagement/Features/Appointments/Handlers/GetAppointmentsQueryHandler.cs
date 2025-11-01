using MediatR;
using HealthcareManagement.Service;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using HealthcareManagement.Features.Appointments.Queries;

namespace HealthcareManagement.Features.Appointments.Handlers
{
    public class GetAppointmentsQueryHandler : IRequestHandler<GetAppointmentsQuery, List<AppointmentDto>>
    {
        private readonly IAppointmentService _appointmentService;
        public GetAppointmentsQueryHandler(IAppointmentService appointmentService)
        {
            _appointmentService = appointmentService;
        }
        public async Task<List<AppointmentDto>> Handle(Queries.GetAppointmentsQuery request, CancellationToken cancellationToken)
        {
            var serviceDtos = await _appointmentService.GetAppointmentsForPatientAsync(request.PatientId);
            // Map Service DTOs to Feature DTOs
            return serviceDtos.Select(a => new AppointmentDto
            {
                Id = a.Id,
                PatientId = a.PatientId,
                DoctorId = a.DoctorId,
                AppointmentDate = a.AppointmentDate,
                DoctorName = a.DoctorName,
                DoctorSpecialization = a.DoctorSpecialization,
                Status = a.Status
            }).ToList();
        }
    }
}
