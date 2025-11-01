using MediatR;
using HealthcareManagement.Service;
using System.Threading;
using System.Threading.Tasks;
using HealthcareManagement.Features.Appointments.Commands;

namespace HealthcareManagement.Features.Appointments.Handlers
{
    public class BookAppointmentCommandHandler : IRequestHandler<BookAppointmentCommand, int>
    {
        private readonly IAppointmentService _appointmentService;
        public BookAppointmentCommandHandler(IAppointmentService appointmentService)
        {
            _appointmentService = appointmentService;
        }
        public async Task<int> Handle(BookAppointmentCommand request, CancellationToken cancellationToken)
        {
            return await _appointmentService.BookAppointmentAsync(request.PatientId, request.DoctorId, request.AppointmentDate);
        }
    }
}
