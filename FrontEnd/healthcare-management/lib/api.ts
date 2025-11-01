import { User, Appointment, RegisterPayload, LoginResponse, RegisterResponse, BookAppointmentPayload, AppointmentConfirmation, DoctorRecommendation } from '@/types';
import { API_ENDPOINTS } from './constants';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function checkResponse(res: Response) {
  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    const errorMessage = errorJson?.message || res.statusText || 'API Error';
    throw new Error(errorMessage);
  }
  return res.json();
}

function getAuthHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  if (!email || !password) throw new Error('Email and password are required');
  const res = await fetch(`${API_URL}${API_ENDPOINTS.LOGIN}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ email, password })
  });
  return checkResponse(res);
}

export async function register(data: RegisterPayload): Promise<RegisterResponse> {
  if (!data.name || !data.email || !data.password) throw new Error('Name, email and password are required');
  const res = await fetch(`${API_URL}${API_ENDPOINTS.REGISTER}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return checkResponse(res);
}

export async function fetchAppointments(token: string): Promise<Appointment[]> {
  if (!token) throw new Error('Authentication token is required');
  const res = await fetch(`${API_URL}${API_ENDPOINTS.APPOINTMENTS}`, {
    headers: getAuthHeaders(token)
  });
  const data = await checkResponse(res);
  // Backend returns AppointmentDate (ISO), DoctorName, etc. Map to frontend shape
  const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
  return (data as any[]).map((a: any) => {
    const d = new Date(a.appointmentDate ?? a.AppointmentDate);
    const date = isNaN(d.getTime()) ? '' : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const time = isNaN(d.getTime()) ? '' : `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const statusNum: number | undefined = (a.status ?? a.Status) as number | undefined;
    const status = statusNum === 2 ? 'completed' : statusNum === 3 ? 'cancelled' : 'scheduled';
    return {
      id: String(a.id ?? a.Id),
      date,
      time,
      doctorName: String(a.doctorName ?? a.DoctorName ?? ''),
      status
    } as Appointment;
  });
}

export async function cancelAppointment(token: string, appointmentId: string | number): Promise<void> {
  if (!token) throw new Error('Authentication token is required');
  const res = await fetch(`${API_URL}${API_ENDPOINTS.APPOINTMENTS}/${appointmentId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token)
  });
  if (!res.ok && res.status !== 204) {
    const errorJson = await res.json().catch(() => null);
    throw new Error(errorJson?.message || res.statusText || 'Failed to cancel appointment');
  }
}

export async function bookAppointment(token: string, payload: BookAppointmentPayload): Promise<AppointmentConfirmation> {
  if (!token) throw new Error('Authentication token is required');
  if (!payload.date || !payload.time || !payload.doctorId) {
    throw new Error('All appointment details are required');
  }
  // Combine date and time to ISO string expected by backend as AppointmentDate
  const appointmentDate = new Date(`${payload.date}T${payload.time}:00`).toISOString();
  const res = await fetch(`${API_URL}${API_ENDPOINTS.BOOK_APPOINTMENT}`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ doctorId: Number(payload.doctorId), appointmentDate })
  });
  const data = await checkResponse(res);
  return { appointmentId: (data?.appointmentId ?? data?.AppointmentId) as number };
}

export async function getAIRecommendations(symptoms: string): Promise<DoctorRecommendation[]> {
  if (!symptoms) throw new Error('Symptoms are required');
  const res = await fetch(`${API_URL}${API_ENDPOINTS.AI_RECOMMENDATIONS}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symptoms })
  });
  return checkResponse(res);
}


