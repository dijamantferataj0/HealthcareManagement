using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HealthcareManagement.Domain.Models
{
    public class Doctor
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public bool Deleted { get; set; }

        // Navigation properties
        public ICollection<Appointment> Appointments { get; set; }
        public ICollection<DoctorSpecialization> DoctorSpecializations { get; set; }
    }
}
