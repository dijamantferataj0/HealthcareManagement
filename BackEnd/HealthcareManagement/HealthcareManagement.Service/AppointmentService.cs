using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HealthcareManagement.Domain.Models;
using HealthcareManagement.Persistence;
using HealthcareManagement.Service.DTOs;
using Microsoft.EntityFrameworkCore;

namespace HealthcareManagement.Service
{
    public class AppointmentService : IAppointmentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly HealthcareDbContext _context;
        public AppointmentService(IUnitOfWork unitOfWork, HealthcareDbContext context)
        {
            _unitOfWork = unitOfWork;
            _context = context;
        }
        public async Task<List<AppointmentDto>> GetAppointmentsForPatientAsync(int patientId)
        {
            var appointments = await _unitOfWork.Appointments.GetByCondition(a => a.PatientId == patientId).ToListAsync();
            // Get doctors with specializations
            var doctors = await _unitOfWork.Doctors.GetByConditionWithIncludes(
             d => true,
             "DoctorSpecializations, DoctorSpecializations.Specialization").ToListAsync();


            return appointments.Select(a =>
            {
                var doctor = doctors.FirstOrDefault(d => d.Id == a.DoctorId);
                var specializations = doctor?.DoctorSpecializations?.Select(ds => ds.Specialization.Name) ?? Enumerable.Empty<string>();
                
                return new AppointmentDto
                {
                    Id = a.Id,
                    DoctorId = a.DoctorId,
                    DoctorName = doctor?.Name ?? string.Empty,
                    DoctorSpecialization = string.Join(", ", specializations),
                    PatientId = a.PatientId,
                    AppointmentDate = a.AppointmentDate,
                    Status = (int)a.Status
                };
            }).ToList();
        }
        public async Task<int> BookAppointmentAsync(int patientId, int doctorId, DateTime appointmentDate)
        {
            var doctorExists = await _unitOfWork.Doctors.GetByCondition(d => d.Id == doctorId).AnyAsync();
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
            await _unitOfWork.Appointments.CreateAsync(appointment);
            await _unitOfWork.SaveChangesAsync();
            return appointment.Id;
        }
        public async Task<bool> CancelAppointmentAsync(int patientId, int appointmentId)
        {
            var appt = await _unitOfWork.Appointments.GetByCondition(a => a.Id == appointmentId && a.PatientId == patientId).FirstOrDefaultAsync();
            if (appt == null)
                return false;
            appt.Status = AppointmentStatus.Canceled;
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
        public async Task<bool> UpdateAppointmentAsync(int patientId, int appointmentId, DateTime appointmentDate)
        {
            var appt = await _unitOfWork.Appointments.GetByCondition(a => a.Id == appointmentId && a.PatientId == patientId).FirstOrDefaultAsync();
            if (appt == null)
                return false;
            appt.AppointmentDate = appointmentDate;
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}
