using MediatR;
using System;

namespace HealthcareManagement.Features.Appointments.Commands
{
    public class UpdateAppointmentCommand : IRequest<bool>
    {
        public int PatientId { get; set; }
        public int AppointmentId { get; set; }
        public DateTime AppointmentDate { get; set; }
    }
}


