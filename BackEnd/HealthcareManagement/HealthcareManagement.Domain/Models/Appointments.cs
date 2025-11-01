using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HealthcareManagement.Domain.Models
{
    public enum AppointmentStatus
    {
        Active = 1,
        Finished = 2,
        Canceled = 3
    }
    public class Appointment
    {
        public int Id { get; set; }
        public int DoctorId { get; set; }
        public int PatientId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public AppointmentStatus Status { get; set; }
        public bool Deleted { get; set; }
        public Doctor Doctor { get; set; }
        public Patient Patient { get; set; }
    }
}
