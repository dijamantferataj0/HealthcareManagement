using MediatR;
using HealthcareManagement.Service;
using System.Threading;
using System.Threading.Tasks;
using HealthcareManagement.Features.Auth.Commands;

namespace HealthcareManagement.Features.Auth.Handlers
{
    public class RegisterPatientCommandHandler : IRequestHandler<RegisterPatientCommand, int>
    {
        private readonly IAuthService _authService;
        public RegisterPatientCommandHandler(IAuthService authService)
        {
            _authService = authService;
        }
        public async Task<int> Handle(RegisterPatientCommand request, CancellationToken cancellationToken)
        {
            return await _authService.RegisterPatientAsync(request.Name, request.Email, request.Password);
        }
    }
}
