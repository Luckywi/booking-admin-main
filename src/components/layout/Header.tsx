'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { signOut } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import React from 'react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { user, userData } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <header className="bg-white shadow">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Bouton hamburger */}
            <button onClick={onToggleSidebar} className="text-black hover:opacity-70">
              <Menu className="w-6 h-6" />
            </button>

            {/* Titre */}
            <h1 className="text-xl font-semibold text-black">
              {userData?.role === 'super_admin' ? 'Administration' : userData?.businessName}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="text-sm bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 border border-black-300 rounded-lg"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
