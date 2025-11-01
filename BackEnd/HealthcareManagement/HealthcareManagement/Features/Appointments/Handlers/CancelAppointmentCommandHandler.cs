using MediatR;
using HealthcareManagement.Service;
using System.Threading;
using System.Threading.Tasks;
using HealthcareManagement.Features.Appointments.Commands;

namespace HealthcareManagement.Features.Appointments.Handlers
{
    public class CancelAppointmentCommandHandler : IRequestHandler<CancelAppointmentCommand, bool>
    {
        private readonly IAppointmentService _appointmentService;
        public CancelAppointmentCommandHandler(IAppointmentService appointmentService)
        {
            _appointmentService = appointmentService;
        }
        public async Task<bool> Handle(CancelAppointmentCommand request, CancellationToken cancellationToken)
        {
            return await _appointmentService.CancelAppointmentAsync(request.PatientId, request.AppointmentId);
        }
    }
}
