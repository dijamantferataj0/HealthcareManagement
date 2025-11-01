using System.Threading.Tasks;
using HealthcareManagement.Domain.Models;

namespace HealthcareManagement.Persistence
{
    public interface IUnitOfWork
    {
        IRepository<Doctor> Doctors { get; }
        IRepository<Patient> Patients { get; }
        IRepository<Appointment> Appointments { get; }
        Task<int> SaveChangesAsync();
    }
}
