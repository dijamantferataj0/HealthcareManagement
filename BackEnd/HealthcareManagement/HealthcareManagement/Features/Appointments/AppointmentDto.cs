namespace HealthcareManagement.Features.Appointments
{
    public class AppointmentDto
    {
        public int Id { get; set; }
        public int DoctorId { get; set; }
        public string DoctorName { get; set; }
        public string DoctorSpecialization { get; set; }
        public int PatientId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public int Status { get; set; }
    }
}
