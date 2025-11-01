import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { DoctorRecommendation, AppointmentConfirmation } from '@/types';
import { getAIRecommendations, bookAppointment, fetchDoctors } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';
import { getAuthToken } from '@/lib/cookies';
import { getSemanticErrorMessage, getFieldErrorMessage } from '@/lib/errorMessages';

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30'
];

const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [symptoms, setSymptoms] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [allDoctors, setAllDoctors] = useState<DoctorRecommendation[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ doctor?: string; date?: string; time?: string; symptoms?: string }>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadDoctors = async () => {
    setLoadingDoctors(true);
    setError(null);
    try {
      const doctors = await fetchDoctors();
      setAllDoctors(doctors);
      if (doctors.length > 0) {
        setSelectedDoctorId(doctors[0].id.toString());
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to load doctors');
    } finally {
      setLoadingDoctors(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDoctors();
    } else {
      setSymptoms('');
      setDate('');
      setTime('');
      setSelectedDoctorId('');
      setError(null);
      setSuccessMsg(null);
      setLoadingRecommendations(false);
      setBookingLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSymptomsChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setSymptoms(e.target.value);
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };

  const handleTimeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setTime(e.target.value);
  };

  const handleDoctorSelect = (id: string) => {
    setSelectedDoctorId(id);
  };

  const fetchRecommendations = async () => {
    setError(null);
    setSuccessMsg(null);
    setFieldErrors({});
    if (!symptoms.trim()) {
      setFieldErrors({ symptoms: 'Please describe your symptoms to get AI recommendations' });
      return;
    }
    setLoadingRecommendations(true);
    try {
      const recommendedDoctors = await getAIRecommendations(symptoms.trim());
      if (recommendedDoctors.length > 0) {
        // Select the first recommended doctor (best fit)
        setSelectedDoctorId(recommendedDoctors[0].id.toString());
        setSuccessMsg(`AI recommends: ${recommendedDoctors[0].name} (${recommendedDoctors[0].specialization})`);
      } else {
        setError('No doctor recommendations found based on your symptoms. Please select a doctor manually from the list above.');
      }
    } catch (err) {
      const semanticError = getSemanticErrorMessage(err);
      setError(semanticError);
      const symptomsError = getFieldErrorMessage(err, 'symptoms');
      if (symptomsError) {
        setFieldErrors({ symptoms: symptomsError });
      }
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setFieldErrors({});

    const errors: { doctor?: string; date?: string; time?: string } = {};
    let isValid = true;

    if (!selectedDoctorId) {
      errors.doctor = 'Please select a doctor for your appointment';
      isValid = false;
    }

    if (!date) {
      errors.date = 'Please select an appointment date';
      isValid = false;
    } else {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.date = 'Appointment date cannot be in the past';
        isValid = false;
      }
    }

    if (!time) {
      errors.time = 'Please select a time slot for your appointment';
      isValid = false;
    }

    if (!isValid) {
      setFieldErrors(errors);
      return;
    }

    if (!user) {
      setError('You must be logged in to book an appointment. Please log in and try again.');
      return;
    }

    setBookingLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Your session has expired. Please log in again.');
        setBookingLoading(false);
        return;
      }
      const confirmation: AppointmentConfirmation = await bookAppointment(
        token,
        {
          date,
          time,
          doctorId: selectedDoctorId
        }
      );
      setSuccessMsg(`Appointment booked successfully! Appointment ID: ${confirmation.appointmentId}`);
      setTimeout(() => {
        onClose();
        router.push(`/appointments?highlight=${confirmation.appointmentId}`);
      }, 1500);
    } catch (err) {
      const semanticError = getSemanticErrorMessage(err);
      setError(semanticError);
      
      // Set field-specific errors if available
      const doctorError = getFieldErrorMessage(err, 'doctor');
      const dateError = getFieldErrorMessage(err, 'date');
      const timeError = getFieldErrorMessage(err, 'time');
      setFieldErrors({
        ...(doctorError && { doctor: doctorError }),
        ...(dateError && { date: dateError }),
        ...(timeError && { time: timeError })
      });
    } finally {
      setBookingLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-colors"
      onClick={onClose}
    >
      <div
        className="bg-surface dark:bg-surface-elevated rounded-lg shadow-2xl max-w-lg w-full p-6 relative border border-border dark:border-divider max-h-[90vh] overflow-y-auto transition-colors"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4 text-text-primary dark:text-text-primary">Book New Appointment</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="doctor" className="block font-medium mb-1 text-text-primary dark:text-text-primary">
              Select Doctor <span className="text-danger dark:text-danger">*</span>
            </label>
            {loadingDoctors ? (
              <p className="text-text-secondary dark:text-text-secondary">Loading doctors...</p>
            ) : allDoctors.length > 0 ? (
              <>
                <ul className={`max-h-48 overflow-y-auto border rounded-lg p-2 space-y-2 bg-surface dark:bg-surface transition-colors ${
                  fieldErrors.doctor
                    ? 'border-danger dark:border-danger'
                    : 'border-border dark:border-divider'
                }`}>
                  {allDoctors.map(doctor => (
                    <li key={doctor.id} className="flex items-center space-x-3 p-2 hover:bg-surface-elevated dark:hover:bg-surface rounded transition-colors">
                      <input
                        type="radio"
                        id={`doctor-${doctor.id}`}
                        name="selectedDoctor"
                        value={doctor.id.toString()}
                        checked={selectedDoctorId === doctor.id.toString()}
                        onChange={() => {
                          handleDoctorSelect(doctor.id.toString());
                          if (fieldErrors.doctor) {
                            setFieldErrors({ ...fieldErrors, doctor: undefined });
                          }
                        }}
                        className="accent-primary"
                        required
                        aria-invalid={!!fieldErrors.doctor}
                      />
                      <label htmlFor={`doctor-${doctor.id}`} className="flex-grow cursor-pointer text-text-primary dark:text-text-primary">
                        <span className="font-semibold">{doctor.name}</span> - <span className="text-text-secondary dark:text-text-secondary">{doctor.specialization}</span>
                      </label>
                    </li>
                  ))}
                </ul>
                {fieldErrors.doctor && (
                  <p id="doctor-error" className="mt-1 text-sm text-danger dark:text-danger" role="alert">
                    {fieldErrors.doctor}
                  </p>
                )}
              </>
            ) : (
              <p className="text-text-secondary dark:text-text-secondary">No doctors available</p>
            )}
          </div>
          <div>
            <label htmlFor="symptoms" className="block font-medium mb-1 text-text-primary dark:text-text-primary">
              Symptoms (for AI recommendation)
            </label>
            <textarea
              id="symptoms"
              name="symptoms"
              rows={3}
              className={`w-full border rounded-lg px-3 py-2 bg-surface dark:bg-surface text-text-primary dark:text-text-primary focus:outline-none focus:ring-2 transition-colors ${
                fieldErrors.symptoms
                  ? 'border-danger dark:border-danger focus:ring-danger'
                  : 'border-border dark:border-divider focus:ring-primary'
              }`}
              value={symptoms}
              onChange={e => {
                handleSymptomsChange(e);
                if (fieldErrors.symptoms) {
                  setFieldErrors({ ...fieldErrors, symptoms: undefined });
                }
              }}
              placeholder="Enter your symptoms to get AI recommendation"
              aria-invalid={!!fieldErrors.symptoms}
              aria-describedby={fieldErrors.symptoms ? 'symptoms-error' : undefined}
            />
            {fieldErrors.symptoms && (
              <p id="symptoms-error" className="mt-1 text-sm text-danger dark:text-danger" role="alert">
                {fieldErrors.symptoms}
              </p>
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={fetchRecommendations}
              disabled={loadingRecommendations || !symptoms.trim()}
              className="bg-secondary dark:bg-secondary-dark text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity font-medium"
            >
              {loadingRecommendations ? 'Getting Recommendation...' : 'Get Recommendation with AI'}
            </button>
          </div>
          {error && !fieldErrors.doctor && !fieldErrors.date && !fieldErrors.time && !fieldErrors.symptoms && (
            <div className="p-3 bg-danger/10 dark:bg-danger/20 border border-danger/20 dark:border-danger/30 rounded-lg">
              <p className="text-danger dark:text-danger font-medium text-sm" role="alert">
                {error}
              </p>
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-success/10 dark:bg-success/20 border border-success/20 dark:border-success/30 rounded-lg">
              <p className="text-success dark:text-success font-medium text-sm" role="alert">
                {successMsg}
              </p>
            </div>
          )}
          <div>
            <label htmlFor="date" className="block font-medium mb-1 text-text-primary dark:text-text-primary">
              Appointment Date <span className="text-danger dark:text-danger">*</span>
            </label>
            <input
              id="date"
              name="date"
              type="date"
              className={`w-full border rounded-lg px-3 py-2 bg-surface dark:bg-surface text-text-primary dark:text-text-primary focus:outline-none focus:ring-2 transition-colors ${
                fieldErrors.date
                  ? 'border-danger dark:border-danger focus:ring-danger'
                  : 'border-border dark:border-divider focus:ring-primary'
              }`}
              value={date}
              onChange={e => {
                handleDateChange(e);
                if (fieldErrors.date) {
                  setFieldErrors({ ...fieldErrors, date: undefined });
                }
              }}
              min={new Date().toISOString().split('T')[0]}
              required
              aria-invalid={!!fieldErrors.date}
              aria-describedby={fieldErrors.date ? 'date-error' : undefined}
            />
            {fieldErrors.date && (
              <p id="date-error" className="mt-1 text-sm text-danger dark:text-danger" role="alert">
                {fieldErrors.date}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="time" className="block font-medium mb-1 text-text-primary dark:text-text-primary">
              Time Slot <span className="text-danger dark:text-danger">*</span>
            </label>
            <select
              id="time"
              name="time"
              className={`w-full border rounded-lg px-3 py-2 bg-surface dark:bg-surface text-text-primary dark:text-text-primary focus:outline-none focus:ring-2 transition-colors ${
                fieldErrors.time
                  ? 'border-danger dark:border-danger focus:ring-danger'
                  : 'border-border dark:border-divider focus:ring-primary'
              }`}
              value={time}
              onChange={e => {
                handleTimeChange(e);
                if (fieldErrors.time) {
                  setFieldErrors({ ...fieldErrors, time: undefined });
                }
              }}
              required
              aria-invalid={!!fieldErrors.time}
              aria-describedby={fieldErrors.time ? 'time-error' : undefined}
            >
              <option value="">Select a time slot</option>
              {timeSlots.map(slot => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
            {fieldErrors.time && (
              <p id="time-error" className="mt-1 text-sm text-danger dark:text-danger" role="alert">
                {fieldErrors.time}
              </p>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border dark:border-divider rounded-lg hover:bg-surface-elevated dark:hover:bg-surface text-text-primary dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-border transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={bookingLoading}
              className="bg-primary dark:bg-primary-dark text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-opacity font-medium"
            >
              {bookingLoading ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentBookingModal;


