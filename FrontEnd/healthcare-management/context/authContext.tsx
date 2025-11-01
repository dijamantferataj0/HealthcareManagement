import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, RegisterPayload } from '@/types';
import * as api from '@/lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  loading: false
});

interface AuthProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'healthcare_token';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.login(email, password);
      const token = (response as any).token ?? (response as any).Token;
      if (!token) throw new Error('Invalid login response');
      localStorage.setItem(STORAGE_KEY, token);
      try {
        const payload = JSON.parse(atob(token.split('.')[1] || ''));
        const userFromToken: User = {
          id: String(payload.sub ?? ''),
          name: String(payload.name ?? ''),
          email: String(payload.unique_name ?? email)
        };
        setUser(userFromToken);
      } catch {
        // Fallback minimal user
        setUser({ id: '', name: '', email });
      }
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterPayload) => {
    setLoading(true);
    try {
      await api.register(data);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  useEffect(() => {
    async function autoLogin() {
      const token = localStorage.getItem(STORAGE_KEY);
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(false);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
        setLoading(false);
      }
    }
    autoLogin();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};


