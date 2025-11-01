using MediatR;
using HealthcareManagement.Service;
using System.Threading;
using System.Threading.Tasks;
using HealthcareManagement.Features.Auth.Commands;

namespace HealthcareManagement.Features.Auth.Handlers
{
    public class LoginPatientCommandHandler : IRequestHandler<LoginPatientCommand, string>
    {
        private readonly IAuthService _authService;
        public LoginPatientCommandHandler(IAuthService authService)
        {
            _authService = authService;
        }
        public async Task<string> Handle(LoginPatientCommand request, CancellationToken cancellationToken)
        {
            return await _authService.LoginPatientAsync(request.Email, request.Password);
        }
    }
}
