using System.Collections.Generic;

namespace HealthcareManagement.Domain.Models
{
    public class Specialization
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Tags { get; set; } // Comma-separated tags/keywords for symptom matching
        public bool Deleted { get; set; }

        // Navigation property for many-to-many relationship
        public ICollection<DoctorSpecialization> DoctorSpecializations { get; set; }
    }
}

