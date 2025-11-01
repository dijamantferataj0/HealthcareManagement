using MediatR;
using System;

namespace HealthcareManagement.Features.Appointments.Commands
{
    public class BookAppointmentCommand : IRequest<int>
    {
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public DateTime AppointmentDate { get; set; }
    }
}
