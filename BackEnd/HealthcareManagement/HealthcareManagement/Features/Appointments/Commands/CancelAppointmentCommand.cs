using MediatR;

namespace HealthcareManagement.Features.Appointments.Commands
{
    public class CancelAppointmentCommand : IRequest<bool>
    {
        public int PatientId { get; set; }
        public int AppointmentId { get; set; }
        public CancelAppointmentCommand(int patientId, int appointmentId)
        {
            PatientId = patientId;
            AppointmentId = appointmentId;
        }
    }
}
