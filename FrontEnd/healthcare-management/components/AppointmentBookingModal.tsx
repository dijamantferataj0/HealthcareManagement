import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { DoctorRecommendation, AppointmentConfirmation } from '@/types';
import { getAIRecommendations, bookAppointment } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';

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
  const [recommendedDoctors, setRecommendedDoctors] = useState<DoctorRecommendation[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSymptoms('');
      setDate('');
      setTime('');
      setRecommendedDoctors([]);
      setSelectedDoctorId('');
      setError(null);
      setSuccessMsg(null);
      setLoadingRecommendations(false);
      setBookingLoading(false);
    }
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
    if (!symptoms.trim()) {
      setError('Please enter symptoms to get recommendations.');
      return;
    }
    setLoadingRecommendations(true);
    try {
      const doctors = await getAIRecommendations(symptoms.trim());
      setRecommendedDoctors(doctors);
      if (doctors.length > 0) {
        setSelectedDoctorId(doctors[0].id.toString());
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch recommendations');
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!symptoms.trim() || !date || !time || !selectedDoctorId) {
      setError('Please fill in all required fields and select a doctor.');
      return;
    }

    if (!user) {
      setError('You must be logged in to book an appointment.');
      return;
    }

    setBookingLoading(true);
    try {
      const confirmation: AppointmentConfirmation = await bookAppointment(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        localStorage.getItem('healthcare_token')!,
        {
          date,
          time,
          doctorId: selectedDoctorId
        }
      );
      setSuccessMsg(`Appointment booked successfully! ID: ${confirmation.appointmentId}`);
      onClose();
      router.push(`/appointments?highlight=${confirmation.appointmentId}`);
      setSymptoms('');
      setDate('');
      setTime('');
      setRecommendedDoctors([]);
      setSelectedDoctorId('');
    } catch (err) {
      setError((err as Error).message || 'Failed to book appointment');
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
            <label htmlFor="symptoms" className="block font-medium mb-1 text-text-primary dark:text-text-primary">
              Symptoms <span className="text-danger dark:text-danger">*</span>
            </label>
            <textarea
              id="symptoms"
              name="symptoms"
              rows={3}
              className="w-full border border-border dark:border-divider rounded-lg px-3 py-2 bg-surface dark:bg-surface text-text-primary dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              value={symptoms}
              onChange={handleSymptomsChange}
              required
            />
          </div>
          <div>
            <button
              type="button"
              onClick={fetchRecommendations}
              disabled={loadingRecommendations}
              className="bg-secondary dark:bg-secondary-dark text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity font-medium"
            >
              {loadingRecommendations ? 'Fetching Recommendations...' : 'Get Doctor Recommendations'}
            </button>
          </div>
          {error && <div className="text-danger dark:text-danger font-medium">{error}</div>}
          {recommendedDoctors.length > 0 && (
            <div>
              <p className="font-medium mb-2 text-text-primary dark:text-text-primary">Recommended Doctors:</p>
              <ul className="max-h-48 overflow-y-auto border border-border dark:border-divider rounded-lg p-2 space-y-2 bg-surface dark:bg-surface transition-colors">
                {recommendedDoctors.map(doctor => (
                  <li key={doctor.id} className="flex items-center space-x-3 p-2 hover:bg-surface-elevated dark:hover:bg-surface rounded transition-colors">
                    <input
                      type="radio"
                      id={`doctor-${doctor.id}`}
                      name="selectedDoctor"
                      value={doctor.id.toString()}
                      checked={selectedDoctorId === doctor.id.toString()}
                      onChange={() => handleDoctorSelect(doctor.id.toString())}
                      className="accent-primary"
                      required
                    />
                    <label htmlFor={`doctor-${doctor.id}`} className="flex-grow cursor-pointer text-text-primary dark:text-text-primary">
                      <span className="font-semibold">{doctor.name}</span> - <span className="text-text-secondary dark:text-text-secondary">{doctor.specialization}</span>
                    </label>
                  </li>
                ))}
              </ul>
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
              className="w-full border border-border dark:border-divider rounded-lg px-3 py-2 bg-surface dark:bg-surface text-text-primary dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              value={date}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          <div>
            <label htmlFor="time" className="block font-medium mb-1 text-text-primary dark:text-text-primary">
              Time Slot <span className="text-danger dark:text-danger">*</span>
            </label>
            <select
              id="time"
              name="time"
              className="w-full border border-border dark:border-divider rounded-lg px-3 py-2 bg-surface dark:bg-surface text-text-primary dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              value={time}
              onChange={handleTimeChange}
              required
            >
              <option value="">Select a time slot</option>
              {timeSlots.map(slot => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
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
          {successMsg && <p className="text-success dark:text-success font-medium">{successMsg}</p>}
        </form>
      </div>
    </div>
  );
};

export default AppointmentBookingModal;


