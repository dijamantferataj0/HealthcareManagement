using System.Collections.Generic;

namespace HealthcareManagement.Features.Doctors
{
    public class DoctorDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Specialization { get; set; } // Comma-separated list of specializations
        public List<string> Specializations { get; set; } // List of specialization names
    }
}
