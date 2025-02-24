'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la page de login
    router.replace('/login');
  }, [router]);

  // Afficher un indicateur de chargement pendant la redirection
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-[10px] h-32 w-32 border-2 border-black"></div>
        <p className="mt-4 text-black">Redirection en cours...</p>
      </div>
    </div>
  );
}