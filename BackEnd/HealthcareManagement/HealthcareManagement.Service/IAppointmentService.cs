using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HealthcareManagement.Service.DTOs;

namespace HealthcareManagement.Service
{
    public interface IAppointmentService
    {
        Task<List<AppointmentDto>> GetAppointmentsForPatientAsync(int patientId);
        Task<int> BookAppointmentAsync(int patientId, int doctorId, DateTime appointmentDate);
        Task<bool> CancelAppointmentAsync(int patientId, int appointmentId);
        Task<bool> UpdateAppointmentAsync(int patientId, int appointmentId, DateTime appointmentDate);
    }
}
