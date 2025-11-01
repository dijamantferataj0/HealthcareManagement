import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-primary text-white shadow-md">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-2xl font-heading font-bold">
          Healthcare App
        </Link>
        <div className="space-x-4">
          {!user ? (
            <>
              <Link href="/login" className="hover:underline">Login</Link>
              <Link href="/register" className="hover:underline">Register</Link>
            </>
          ) : (
            <>
              <Link href="/appointments" className="hover:underline">Appointments</Link>
              <button
                onClick={logout}
                className="ml-4 bg-secondary px-3 py-1 rounded hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                aria-label="Logout"
                type="button"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;


