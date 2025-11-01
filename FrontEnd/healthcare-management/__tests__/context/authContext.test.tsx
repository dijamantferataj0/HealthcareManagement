import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, AuthContext } from '@/context/authContext';
import * as api from '@/lib/api';

jest.mock('@/lib/api');

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.resetAllMocks();
  });

  it('provides default values', () => {
    const wrapper: React.FC = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
    expect(result.current.user).toBeNull();
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.register).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(result.current.loading).toBe(true || false);
  });

  it('login updates user and stores token', async () => {
    const user = { id: 'u1', name: 'Test', email: 'test@example.com' };
    (api.login as jest.Mock).mockResolvedValue({ token: 'token123', user });

    const wrapper: React.FC = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(localStorage.getItem('healthcare_token')).toBe('token123');
    expect(result.current.user).toEqual(user);
  });

  it('login failure clears user', async () => {
    (api.login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

    const wrapper: React.FC = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

    await expect(
      act(async () => {
        await result.current.login('test@example.com', 'wrongpassword');
      })
    ).rejects.toThrow('Invalid credentials');

    expect(result.current.user).toBeNull();
  });

  it('register calls api.register', async () => {
    (api.register as jest.Mock).mockResolvedValue({ success: true, message: 'Registered' });

    const wrapper: React.FC = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

    await act(async () => {
      await result.current.register({ name: 'Test', email: 'test@example.com', password: 'pass' });
    });

    expect(api.register).toHaveBeenCalledWith({ name: 'Test', email: 'test@example.com', password: 'pass' });
  });

  it('logout clears user and token', () => {
    localStorage.setItem('healthcare_token', 'token123');
    const wrapper: React.FC = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(localStorage.getItem('healthcare_token')).toBeNull();
    expect(result.current.user).toBeNull();
  });
});


