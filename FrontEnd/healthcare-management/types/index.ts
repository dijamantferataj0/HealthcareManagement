export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  doctorName: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

export interface BookAppointmentPayload {
  date: string;
  time: string;
  doctorId: string;
}

export interface AppointmentConfirmation {
  appointmentId: number;
}

export interface DoctorRecommendation {
  id: number;
  name: string;
  specialization: string;
}


