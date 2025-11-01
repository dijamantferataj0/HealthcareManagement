using MediatR;
using HealthcareManagement.Domain.Models;
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
        private readonly IDoctorService _doctorService;
        public GetAppointmentsQueryHandler(IAppointmentService appointmentService, IDoctorService doctorService)
        {
            _appointmentService = appointmentService;
            _doctorService = doctorService;
        }
        public async Task<List<AppointmentDto>> Handle(Queries.GetAppointmentsQuery request, CancellationToken cancellationToken)
        {
            var appointments = await _appointmentService.GetAppointmentsForPatientAsync(request.PatientId);
            var allDoctors = await _doctorService.GetAllDoctorsAsync();
            return appointments.Select(a => new AppointmentDto
            {
                Id = a.Id,
                PatientId = a.PatientId,
                DoctorId = a.DoctorId,
                AppointmentDate = a.AppointmentDate,
                DoctorName = allDoctors.FirstOrDefault(d => d.Id == a.DoctorId)?.Name,
                DoctorSpecialization = allDoctors.FirstOrDefault(d => d.Id == a.DoctorId)?.Specialization,
                Status = (int)a.Status
            }).ToList();
        }
    }
}
