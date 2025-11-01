using MediatR;

namespace HealthcareManagement.Features.Auth.Commands
{
    public class RegisterPatientCommand : IRequest<int>
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
