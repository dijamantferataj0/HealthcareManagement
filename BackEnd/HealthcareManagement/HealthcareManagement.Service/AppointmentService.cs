using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HealthcareManagement.Domain.Models;
using HealthcareManagement.Persistence;

namespace HealthcareManagement.Service
{
    public class AppointmentService : IAppointmentService
    {
        private readonly IUnitOfWork _unitOfWork;
        public AppointmentService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<List<Appointment>> GetAppointmentsForPatientAsync(int patientId)
        {
            var list = await _unitOfWork.Appointments.FindAsync(a => a.PatientId == patientId);
            return list.ToList();
        }
        public async Task<int> BookAppointmentAsync(int patientId, int doctorId, DateTime appointmentDate)
        {
            var doctorExists = (await _unitOfWork.Doctors.FindAsync(d => d.Id == doctorId)).Any();
            if (!doctorExists)
                throw new Exception("Doctor not found");
            var appointment = new Appointment
            {
                PatientId = patientId,
                DoctorId = doctorId,
                AppointmentDate = appointmentDate,
                Status = AppointmentStatus.Active,
                Deleted = false
            };
            await _unitOfWork.Appointments.AddAsync(appointment);
            await _unitOfWork.SaveChangesAsync();
            return appointment.Id;
        }
        public async Task<bool> CancelAppointmentAsync(int patientId, int appointmentId)
        {
            var appt = (await _unitOfWork.Appointments.FindAsync(a => a.Id == appointmentId && a.PatientId == patientId)).FirstOrDefault();
            if (appt == null)
                return false;
            appt.Status = AppointmentStatus.Canceled;
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
        public async Task<bool> UpdateAppointmentAsync(int patientId, int appointmentId, DateTime appointmentDate)
        {
            var appt = (await _unitOfWork.Appointments.FindAsync(a => a.Id == appointmentId && a.PatientId == patientId)).FirstOrDefault();
            if (appt == null)
                return false;
            appt.AppointmentDate = appointmentDate;
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}
