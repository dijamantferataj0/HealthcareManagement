using System.Collections.Generic;

namespace HealthcareManagement.Service.DTOs
{
    public class DoctorDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty; // Comma-separated list
        public List<string> Specializations { get; set; } = new List<string>(); // List of specialization names
    }
}

