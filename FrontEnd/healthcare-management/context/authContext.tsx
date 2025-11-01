import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, RegisterPayload } from '@/types';
import * as api from '@/lib/api';
import { setTokenCookie, getAuthToken, removeTokenCookie } from '@/lib/cookies';

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


export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.login(email, password);
      const token = (response as any).token ?? (response as any).Token;
      if (!token) throw new Error('Invalid login response');
      setTokenCookie(token);
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
    removeTokenCookie();
    // Also clear localStorage if it exists (for cleanup)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('healthcare_token');
    }
    setUser(null);
  };

  useEffect(() => {
    async function autoLogin() {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        // Token is already validated for expiration in getAuthToken()
        // Decode token to get user info
        try {
          const payload = JSON.parse(atob(token.split('.')[1] || ''));
          const userFromToken: User = {
            id: String(payload.sub ?? ''),
            name: String(payload.name ?? ''),
            email: String(payload.unique_name ?? '')
          };
          setUser(userFromToken);
        } catch {
          // Invalid token format, clear it
          removeTokenCookie();
          setUser(null);
        }
        setLoading(false);
      } catch {
        removeTokenCookie();
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


