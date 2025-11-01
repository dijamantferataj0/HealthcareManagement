import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import AppointmentBookingModal from '@/components/AppointmentBookingModal';
import { Appointment } from '@/types';
import { fetchAppointments } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';

const AppointmentsPage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function loadAppointments() {
      if (!user) return;
      setLoadingAppointments(true);
      setError(null);
      try {
        const token = localStorage.getItem('healthcare_token');
        if (!token) {
          setError('Authentication token missing');
          setAppointments([]);
          return;
        }
        const data = await fetchAppointments(token);
        setAppointments(data);
      } catch (err) {
        setError((err as Error).message || 'Failed to fetch appointments');
        setAppointments([]);
      } finally {
        setLoadingAppointments(false);
      }
    }
    loadAppointments();
  }, [user]);

  useEffect(() => {
    const id = (router.query.highlight as string) || null;
    if (id) {
      setHighlightId(id);
      // scroll into view after table renders
      setTimeout(() => {
        const row = document.getElementById(`appointment-row-${id}`);
        if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      // clear highlight after a short while
      const t = setTimeout(() => setHighlightId(null), 4000);
      return () => clearTimeout(t);
    }
  }, [router.query.highlight]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Your Appointments</h1>
          <button
            onClick={openModal}
            className="bg-secondary text-white px-4 py-2 rounded hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
          >
            Book Appointment
          </button>
        </div>

        {loadingAppointments && <p>Loading appointments...</p>}
        {error && <p className="text-danger font-medium">{error}</p>}

        {!loadingAppointments && appointments.length === 0 && !error && (
          <p>You currently have no appointments scheduled.</p>
        )}

        {!loadingAppointments && appointments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 rounded">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Time</th>
                  <th className="px-4 py-2 text-left">Doctor</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(app => (
                  <tr
                    key={app.id}
                    id={`appointment-row-${app.id}`}
                    className={`border-t border-gray-300 ${highlightId === String(app.id) ? 'bg-yellow-100 transition-colors' : ''}`}
                  >
                    <td className="px-4 py-2">{app.date}</td>
                    <td className="px-4 py-2">{app.time}</td>
                    <td className="px-4 py-2">{app.doctorName}</td>
                    <td className="px-4 py-2 capitalize">{app.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <AppointmentBookingModal isOpen={isModalOpen} onClose={closeModal} />
      </div>
    </Layout>
  );
};

export default AppointmentsPage;


