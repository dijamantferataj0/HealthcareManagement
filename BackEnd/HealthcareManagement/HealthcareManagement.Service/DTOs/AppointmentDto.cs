using System;

namespace HealthcareManagement.Service.DTOs
{
    public class AppointmentDto
    {
        public int Id { get; set; }
        public int DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string DoctorSpecialization { get; set; } = string.Empty;
        public int PatientId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public int Status { get; set; }
    }
}

