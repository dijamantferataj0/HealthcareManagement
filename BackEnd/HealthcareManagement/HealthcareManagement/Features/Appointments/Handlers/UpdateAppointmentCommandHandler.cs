using MediatR;
using System.Threading;
using System.Threading.Tasks;
using HealthcareManagement.Features.Appointments.Commands;
using HealthcareManagement.Service;

namespace HealthcareManagement.Features.Appointments.Handlers
{
    public class UpdateAppointmentCommandHandler : IRequestHandler<UpdateAppointmentCommand, bool>
    {
        private readonly IAppointmentService _appointmentService;
        public UpdateAppointmentCommandHandler(IAppointmentService appointmentService)
        {
            _appointmentService = appointmentService;
        }
        public async Task<bool> Handle(UpdateAppointmentCommand request, CancellationToken cancellationToken)
        {
            return await _appointmentService.UpdateAppointmentAsync(request.PatientId, request.AppointmentId, request.AppointmentDate);
        }
    }
}


