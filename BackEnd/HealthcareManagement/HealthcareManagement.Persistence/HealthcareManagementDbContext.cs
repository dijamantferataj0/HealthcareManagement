using HealthcareManagement.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace HealthcareManagement.Persistence
{
    public class HealthcareDbContext : DbContext
    {
        public HealthcareDbContext(DbContextOptions<HealthcareDbContext> options)
            : base(options) { }

        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<Appointment> Appointments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Global query filters to exclude soft-deleted entities
            modelBuilder.Entity<Doctor>().HasQueryFilter(d => !d.Deleted);
            modelBuilder.Entity<Patient>().HasQueryFilter(p => !p.Deleted);
            modelBuilder.Entity<Appointment>().HasQueryFilter(a => !a.Deleted);

            // Seed doctors (not deleted)
            modelBuilder.Entity<Doctor>().HasData(
                new Doctor { Id = 1, Name = "Dr. Alice Smith", Specialization = "Cardiology", Deleted = false },
                new Doctor { Id = 2, Name = "Dr. Bob Wang", Specialization = "Dermatology", Deleted = false },
                new Doctor { Id = 3, Name = "Dr. Carla Jones", Specialization = "Neurology", Deleted = false }
            );
        }
    }
}
