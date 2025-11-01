import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AppointmentBookingModal from '@/components/AppointmentBookingModal';
import * as api from '@/lib/api';
import { AuthContext } from '@/context/authContext';

const mockGetAIRecommendations = jest.spyOn(api, 'getAIRecommendations');
const mockBookAppointment = jest.spyOn(api, 'bookAppointment');

const mockUser = { id: 'user1', name: 'Test User', email: 'test@example.com' };

function renderWithAuthContext(isOpen: boolean, onClose: () => void) {
  return render(
    <AuthContext.Provider value={{ user: mockUser, login: jest.fn(), logout: jest.fn(), register: jest.fn(), loading: false }}>
      <AppointmentBookingModal isOpen={isOpen} onClose={onClose} />
    </AuthContext.Provider>
  );
}

describe('AppointmentBookingModal', () => {
  beforeEach(() => {
    mockGetAIRecommendations.mockReset();
    mockBookAppointment.mockReset();
    localStorage.setItem('healthcare_token', 'mocktoken');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('does not render if isOpen is false', () => {
    const { container } = renderWithAuthContext(false, jest.fn());
    expect(container.firstChild).toBeNull();
  });

  it('renders modal and form fields', () => {
    renderWithAuthContext(true, jest.fn());
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/symptoms/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/appointment date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time slot/i)).toBeInTheDocument();
  });

  it('shows error if fetching recommendations without symptoms', async () => {
    renderWithAuthContext(true, jest.fn());
    fireEvent.click(screen.getByRole('button', { name: /get doctor recommendations/i }));
    await waitFor(() => {
      expect(screen.getByText(/please enter symptoms/i)).toBeInTheDocument();
    });
  });

  it('fetches and displays doctor recommendations', async () => {
    mockGetAIRecommendations.mockResolvedValueOnce([
      { id: 'doc1', name: 'Dr. A', specialty: 'Cardiology', rating: 4.7 },
      { id: 'doc2', name: 'Dr. B', specialty: 'Dermatology', rating: 4.3 }
    ]);
    renderWithAuthContext(true, jest.fn());

    fireEvent.change(screen.getByLabelText(/symptoms/i), { target: { value: 'headache' } });
    fireEvent.click(screen.getByRole('button', { name: /get doctor recommendations/i }));

    await waitFor(() => {
      expect(screen.getByText(/recommended doctors/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/dr. a/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/dr. b/i)).toBeInTheDocument();
    });
  });

  it('shows error on failed recommendation fetch', async () => {
    mockGetAIRecommendations.mockRejectedValueOnce(new Error('Failed to fetch'));
    renderWithAuthContext(true, jest.fn());

    fireEvent.change(screen.getByLabelText(/symptoms/i), { target: { value: 'cough' } });
    fireEvent.click(screen.getByRole('button', { name: /get doctor recommendations/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
    });
  });

  it('validates form and submits booking', async () => {
    mockGetAIRecommendations.mockResolvedValueOnce([{ id: 'doc1', name: 'Dr. A', specialty: 'Cardiology', rating: 4.7 }]);
    mockBookAppointment.mockResolvedValueOnce({ appointmentId: 'app123', status: 'scheduled' });
    const onClose = jest.fn();

    renderWithAuthContext(true, onClose);

    fireEvent.change(screen.getByLabelText(/symptoms/i), { target: { value: 'fever' } });
    fireEvent.click(screen.getByRole('button', { name: /get doctor recommendations/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/dr. a/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/appointment date/i), { target: { value: '2024-06-10' } });
    fireEvent.change(screen.getByLabelText(/time slot/i), { target: { value: '09:00' } });
    fireEvent.click(screen.getByLabelText(/dr. a/i));

    fireEvent.click(screen.getByRole('button', { name: /book appointment/i }));

    await waitFor(() => {
      expect(mockBookAppointment).toHaveBeenCalledWith('mocktoken', {
        symptoms: 'fever',
        date: '2024-06-10',
        time: '09:00',
        doctorId: 'doc1'
      });
      expect(screen.getByText(/appointment booked successfully/i)).toBeInTheDocument();
    });
  });

  it('shows error if required fields missing on submit', async () => {
    renderWithAuthContext(true, jest.fn());
    fireEvent.click(screen.getByRole('button', { name: /book appointment/i }));
    await waitFor(() => {
      expect(screen.getByText(/please fill in all required fields/i)).toBeInTheDocument();
    });
  });
});


