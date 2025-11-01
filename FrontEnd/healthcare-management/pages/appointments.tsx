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
      <div className="max-w-5xl mx-auto bg-surface dark:bg-surface-elevated p-6 rounded-lg shadow-lg border border-border dark:border-divider transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-text-primary dark:text-text-primary">Your Appointments</h1>
          <button
            onClick={openModal}
            className="bg-secondary dark:bg-secondary-dark text-white px-4 py-2 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-opacity font-medium"
          >
            Book Appointment
          </button>
        </div>

        {loadingAppointments && <p className="text-text-secondary dark:text-text-secondary">Loading appointments...</p>}
        {error && <p className="text-danger dark:text-danger font-medium">{error}</p>}

        {!loadingAppointments && appointments.length === 0 && !error && (
          <p className="text-text-secondary dark:text-text-secondary">You currently have no appointments scheduled.</p>
        )}

        {!loadingAppointments && appointments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border border-border dark:border-divider rounded-lg">
              <thead className="bg-primary dark:bg-primary-dark text-white">
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
                    className={`border-t border-border dark:border-divider text-text-primary dark:text-text-primary ${
                      highlightId === String(app.id)
                        ? 'bg-accent/10 dark:bg-accent/20 transition-colors'
                        : 'hover:bg-surface-elevated dark:hover:bg-surface transition-colors'
                    }`}
                  >
                    <td className="px-4 py-2">{app.date}</td>
                    <td className="px-4 py-2">{app.time}</td>
                    <td className="px-4 py-2">{app.doctorName}</td>
                    <td className="px-4 py-2 capitalize">
                      <span className={`inline-block px-2 py-1 rounded text-sm ${
                        app.status === 'scheduled' ? 'bg-info/20 text-info dark:bg-info/30' :
                        app.status === 'completed' ? 'bg-success/20 text-success dark:bg-success/30' :
                        'bg-danger/20 text-danger dark:bg-danger/30'
                      }`}>
                        {app.status}
                      </span>
                    </td>
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


