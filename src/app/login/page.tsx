'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to secure login page
    router.replace('/login/secure');
  }, [router]);

  return (
    <div className="min-h-screen bg-apple-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-sisdat-blue-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-apple-sm text-apple-text-secondary">Redirigiendo a acceso seguro...</p>
      </div>
    </div>
  );
}