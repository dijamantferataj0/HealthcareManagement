using System.Threading.Tasks;

namespace HealthcareManagement.Service
{
    public interface IAuthService
    {
        Task<int> RegisterPatientAsync(string name, string email, string password);
        Task<string> LoginPatientAsync(string email, string password);
    }
}
