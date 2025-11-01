import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AppointmentsPage from '@/pages/appointments';
import { AuthContext } from '@/context/authContext';
import * as api from '@/lib/api';
import { useRouter } from 'next/router';

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

const mockFetchAppointments = jest.spyOn(api, 'fetchAppointments');

const mockUser = {
  id: 'user1',
  name: 'Test User',
  email: 'test@example.com'
};

const appointmentsMock = [
  {
    id: 'app1',
    date: '2024-06-01',
    time: '09:00',
    doctorName: 'Dr. Smith',
    status: 'scheduled'
  },
  {
    id: 'app2',
    date: '2024-06-02',
    time: '10:30',
    doctorName: 'Dr. Jones',
    status: 'completed'
  }
];

function renderWithAuthContext(user = mockUser, loading = false) {
  return render(
    <AuthContext.Provider value={{ user, login: jest.fn(), logout: jest.fn(), register: jest.fn(), loading }}>
      <AppointmentsPage />
    </AuthContext.Provider>
  );
}

describe('Appointments Page', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ replace: jest.fn() });
    mockFetchAppointments.mockReset();
    localStorage.setItem('healthcare_token', 'mocktoken');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('redirects to login if not authenticated', () => {
    const replaceMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ replace: replaceMock });
    renderWithAuthContext(null, false);
    expect(replaceMock).toHaveBeenCalledWith('/login');
  });

  it('fetches and displays appointments', async () => {
    mockFetchAppointments.mockResolvedValueOnce(appointmentsMock);
    renderWithAuthContext();

    expect(screen.getByText(/loading appointments/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Your Appointments')).toBeInTheDocument();
      expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
      expect(screen.getByText('Dr. Jones')).toBeInTheDocument();
    });
  });

  it('shows message if no appointments', async () => {
    mockFetchAppointments.mockResolvedValueOnce([]);
    renderWithAuthContext();

    await waitFor(() => {
      expect(screen.getByText(/no appointments scheduled/i)).toBeInTheDocument();
    });
  });

  it('displays error if fetch fails', async () => {
    mockFetchAppointments.mockRejectedValueOnce(new Error('API error'));
    renderWithAuthContext();

    await waitFor(() => {
      expect(screen.getByText(/api error/i)).toBeInTheDocument();
    });
  });

  it('opens and closes appointment booking modal', async () => {
    mockFetchAppointments.mockResolvedValueOnce(appointmentsMock);
    renderWithAuthContext();

    await waitFor(() => {
      expect(screen.getByText('Your Appointments')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /book appointment/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });
});


