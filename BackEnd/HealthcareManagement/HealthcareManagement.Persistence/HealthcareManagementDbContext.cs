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
        public DbSet<Specialization> Specializations { get; set; }
        public DbSet<DoctorSpecialization> DoctorSpecializations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);


            modelBuilder.Entity<DoctorSpecialization>()
                .HasKey(ds => new { ds.DoctorId, ds.SpecializationId });

            modelBuilder.Entity<DoctorSpecialization>()
                .HasOne(ds => ds.Doctor)
                .WithMany(d => d.DoctorSpecializations)
                .HasForeignKey(ds => ds.DoctorId)
                .IsRequired(); 

            modelBuilder.Entity<DoctorSpecialization>()
                .HasOne(ds => ds.Specialization)
                .WithMany(s => s.DoctorSpecializations)
                .HasForeignKey(ds => ds.SpecializationId)
                .IsRequired(); 


            modelBuilder.Entity<Doctor>().Property(d => d.Deleted).HasDefaultValue(false);
            modelBuilder.Entity<Patient>().Property(p => p.Deleted).HasDefaultValue(false);
            modelBuilder.Entity<Appointment>().Property(a => a.Deleted).HasDefaultValue(false);
            modelBuilder.Entity<Specialization>().Property(s => s.Deleted).HasDefaultValue(false);


            modelBuilder.Entity<Doctor>().HasQueryFilter(d => !d.Deleted);
            modelBuilder.Entity<Patient>().HasQueryFilter(p => !p.Deleted);
            modelBuilder.Entity<Appointment>().HasQueryFilter(a => !a.Deleted);
            modelBuilder.Entity<Specialization>().HasQueryFilter(s => !s.Deleted);


            modelBuilder.Entity<DoctorSpecialization>()
                .HasQueryFilter(ds => !ds.Doctor.Deleted && !ds.Specialization.Deleted);

            // -----------------------------
            // Seed Specializations with tags
            // -----------------------------
            modelBuilder.Entity<Specialization>().HasData(
                new Specialization { Id = 1, Name = "Cardiology", Tags = "heart,chest pain,cardio,cardiac,blood pressure,hypertension,arrhythmia,chest discomfort", Deleted = false },
                new Specialization { Id = 2, Name = "Dermatology", Tags = "skin,rash,acne,eczema,psoriasis,dermatitis,itchy,redness,lesion,mole", Deleted = false },
                new Specialization { Id = 3, Name = "Neurology", Tags = "headache,seizure,neuro,neurological,migraine,epilepsy,stroke,brain,memory,dizziness", Deleted = false },
                new Specialization { Id = 4, Name = "General Medicine", Tags = "cough,fever,flu,cold,general,common,infection,virus,bacterial,symptoms", Deleted = false },
                new Specialization { Id = 5, Name = "Internal Medicine", Tags = "internal,organ,digestive,stomach,abdomen,chronic,diabetes,hypertension,metabolic", Deleted = false },
                new Specialization { Id = 6, Name = "Pediatrics", Tags = "child,children,pediatric,baby,infant,toddler,kid,childhood,adolescent", Deleted = false },
                new Specialization { Id = 7, Name = "Orthopedics", Tags = "bone,joint,fracture,broken,sprain,orthopedic,back pain,knee,shoulder,spine", Deleted = false },
                new Specialization { Id = 8, Name = "Emergency Medicine", Tags = "emergency,urgent,acute,trauma,injury,accident,severe,critical,emergency care", Deleted = false }
            );

            // -----------------------------
            // Seed Doctors
            // -----------------------------
            modelBuilder.Entity<Doctor>().HasData(
                new Doctor { Id = 1, Name = "Filan Fisteku", Deleted = false },
                new Doctor { Id = 2, Name = "Dem Alia", Deleted = false },
                new Doctor { Id = 3, Name = "Ali Dema", Deleted = false },
                new Doctor { Id = 4, Name = "Sadik Sadiku", Deleted = false }
            );

            // -----------------------------
            // Seed Doctor-Specialization relationships
            // -----------------------------
            modelBuilder.Entity<DoctorSpecialization>().HasData(
                new DoctorSpecialization { DoctorId = 1, SpecializationId = 1 },
                new DoctorSpecialization { DoctorId = 1, SpecializationId = 5 },
                new DoctorSpecialization { DoctorId = 2, SpecializationId = 2 },
                new DoctorSpecialization { DoctorId = 2, SpecializationId = 4 },
                new DoctorSpecialization { DoctorId = 3, SpecializationId = 3 },
                new DoctorSpecialization { DoctorId = 3, SpecializationId = 8 },
                new DoctorSpecialization { DoctorId = 4, SpecializationId = 4 },
                new DoctorSpecialization { DoctorId = 4, SpecializationId = 6 }
            );
        }


    }
}
