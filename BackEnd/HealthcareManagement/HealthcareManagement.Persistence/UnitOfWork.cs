using System.Threading.Tasks;
using HealthcareManagement.Domain.Models;

namespace HealthcareManagement.Persistence
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly HealthcareDbContext _context;
        private IRepository<Doctor> _doctors;
        private IRepository<Patient> _patients;
        private IRepository<Appointment> _appointments;
        public UnitOfWork(HealthcareDbContext context)
        {
            _context = context;
        }
        public IRepository<Doctor> Doctors => _doctors ??= new Repository<Doctor>(_context);
        public IRepository<Patient> Patients => _patients ??= new Repository<Patient>(_context);
        public IRepository<Appointment> Appointments => _appointments ??= new Repository<Appointment>(_context);
        public async Task<int> SaveChangesAsync() => await _context.SaveChangesAsync();
    }
}
