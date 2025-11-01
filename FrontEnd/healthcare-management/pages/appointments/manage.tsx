import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';
import { Appointment } from '@/types';
import { fetchAppointments, cancelAppointment } from '@/lib/api';

const ManageAppointmentsPage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  const load = async () => {
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
  };

  useEffect(() => {
    load();
  }, [user]);

  const onCancel = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to cancel this appointment?');
    if (!confirm) return;
    try {
      setCancellingId(id);
      const token = localStorage.getItem('healthcare_token');
      if (!token) throw new Error('Authentication token missing');
      await cancelAppointment(token, id);
      await load();
    } catch (err) {
      alert((err as Error).message || 'Failed to cancel appointment');
    } finally {
      setCancellingId(null);
    }
  };

  const startEdit = (app: Appointment) => {
    setEditingId(app.id);
    setEditDate(app.date);
    setEditTime(app.time);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDate('');
    setEditTime('');
  };

  const saveEdit = async () => {
    if (!editingId || !editDate || !editTime) return;
    try {
      const token = localStorage.getItem('healthcare_token');
      if (!token) throw new Error('Authentication token missing');
      const iso = new Date(`${editDate}T${editTime}:00`).toISOString();
      const res = await fetch(`/api/appointments/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ appointmentDate: iso })
      });
      if (!res.ok && res.status !== 204) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || res.statusText || 'Failed to update appointment');
      }
      await load();
      cancelEdit();
    } catch (err) {
      alert((err as Error).message || 'Failed to update appointment');
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Manage Appointments</h1>
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
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(app => (
                  <tr key={app.id} className="border-t border-gray-300">
                    <td className="px-4 py-2">
                      {editingId === app.id ? (
                        <input
                          type="date"
                          className="border border-gray-300 rounded px-2 py-1"
                          value={editDate}
                          onChange={e => setEditDate(e.target.value)}
                        />
                      ) : (
                        app.date
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {editingId === app.id ? (
                        <input
                          type="time"
                          className="border border-gray-300 rounded px-2 py-1"
                          value={editTime}
                          onChange={e => setEditTime(e.target.value)}
                        />
                      ) : (
                        app.time
                      )}
                    </td>
                    <td className="px-4 py-2">{app.doctorName}</td>
                    <td className="px-4 py-2 capitalize">{app.status}</td>
                    <td className="px-4 py-2">
                      {editingId === app.id ? (
                        <div className="flex gap-2">
                          <button onClick={saveEdit} className="bg-primary text-white px-3 py-1 rounded hover:bg-primary/90">Save</button>
                          <button onClick={cancelEdit} className="border border-gray-300 px-3 py-1 rounded hover:bg-gray-100">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(app)}
                            className="bg-secondary text-white px-3 py-1 rounded hover:bg-secondary/90"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onCancel(app.id)}
                            disabled={cancellingId === app.id}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            {cancellingId === app.id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ManageAppointmentsPage;


