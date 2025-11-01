import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';

const HomePage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace('/appointments');
    } else {
      router.replace('/login');
    }
  }, [user, loading, router]);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-6">
        <p>Loading...</p>
      </div>
    </Layout>
  );
};

export default HomePage;


