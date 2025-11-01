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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Book New Appointment</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="symptoms" className="block font-medium mb-1">
              Symptoms <span className="text-danger">*</span>
            </label>
            <textarea
              id="symptoms"
              name="symptoms"
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
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
              className="bg-secondary text-white px-4 py-2 rounded hover:bg-secondary/90 disabled:opacity-50"
            >
              {loadingRecommendations ? 'Fetching Recommendations...' : 'Get Doctor Recommendations'}
            </button>
          </div>
          {error && <div className="text-danger font-medium">{error}</div>}
          {recommendedDoctors.length > 0 && (
            <div>
              <p className="font-medium mb-2">Recommended Doctors:</p>
              <ul className="max-h-48 overflow-y-auto border border-gray-300 rounded p-2 space-y-2">
                {recommendedDoctors.map(doctor => (
                  <li key={doctor.id} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id={`doctor-${doctor.id}`}
                      name="selectedDoctor"
                      value={doctor.id.toString()}
                      checked={selectedDoctorId === doctor.id.toString()}
                      onChange={() => handleDoctorSelect(doctor.id.toString())}
                      required
                    />
                    <label htmlFor={`doctor-${doctor.id}`} className="flex-grow cursor-pointer">
                      <span className="font-semibold">{doctor.name}</span> - {doctor.specialization}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <label htmlFor="date" className="block font-medium mb-1">
              Appointment Date <span className="text-danger">*</span>
            </label>
            <input
              id="date"
              name="date"
              type="date"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={date}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          <div>
            <label htmlFor="time" className="block font-medium mb-1">
              Time Slot <span className="text-danger">*</span>
            </label>
            <select
              id="time"
              name="time"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
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
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={bookingLoading}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {bookingLoading ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>
          {successMsg && <p className="text-green-600 font-medium">{successMsg}</p>}
        </form>
      </div>
    </div>
  );
};

export default AppointmentBookingModal;


