using MediatR;

namespace HealthcareManagement.Features.Auth.Commands
{
    public class LoginPatientCommand : IRequest<string>
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
