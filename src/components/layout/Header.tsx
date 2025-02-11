'use client';
import { useAuth } from '@/components/auth/AuthProvider';
import { signOut } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user } = useAuth();
  const router = useRouter();
  const { userData } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };
  
  return (
    <header className="bg-white border-b border-black">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex-1 flex items-center">
            <h1 className="text-xl font-semibold text-black">
              {userData?.role === 'super_admin' ? 'Administration' : userData?.businessName}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-black">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="text-sm bg-white hover:bg-gray-50 text-black font-medium py-2 px-4 border border-black rounded-[10px]"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}