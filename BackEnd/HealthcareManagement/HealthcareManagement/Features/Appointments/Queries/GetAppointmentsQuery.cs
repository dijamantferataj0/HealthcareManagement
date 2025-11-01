using MediatR;
using System.Collections.Generic;

namespace HealthcareManagement.Features.Appointments.Queries
{
    public class GetAppointmentsQuery : IRequest<List<AppointmentDto>>
    {
        public int PatientId { get; set; }
        public GetAppointmentsQuery(int patientId)
        {
            PatientId = patientId;
        }
    }
}
