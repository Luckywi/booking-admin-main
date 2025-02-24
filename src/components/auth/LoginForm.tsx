'use client';
import { useState, useEffect } from 'react';
import { signIn } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/lib/firebase/firestore';
import { useAuth } from '@/components/auth/AuthProvider';

export default function LoginForm() {
  const router = useRouter();
  const { user, userData, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Rediriger automatiquement l'utilisateur déjà connecté
  useEffect(() => {
    if (!authLoading && user && userData) {
      // Si l'utilisateur est déjà connecté, rediriger en fonction du rôle
      if (userData.role === 'super_admin') {
        router.push('/dashboard/admins');
      } else if (userData.role === 'admin' && userData.businessId) {
        router.push(`/dashboard/business/${userData.businessId}/appointments`);
      }
    }
  }, [user, userData, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn({ email, password });
      if (result.error) {
        setError('Email ou mot de passe incorrect');
      } else if (result.user) {
        // Vérifier le rôle de l'utilisateur
        const userData = await getUserData(result.user.uid);
        
        if (userData?.role === 'super_admin') {
          router.push('/dashboard/admins');
        } else if (userData?.role === 'admin') {
          router.push(`/dashboard/business/${userData.businessId}/appointments`);
        } else {
          setError('Accès non autorisé');
        }
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-[10px] h-32 w-32 border-2 border-black"></div>
        <p className="mt-4 text-black">Chargement...</p>
      </div>
    );
  }

  // Si l'utilisateur est déjà connecté, ne pas afficher le formulaire (il sera redirigé)
  if (user && userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-[10px] h-32 w-32 border-2 border-black"></div>
          <p className="mt-4 text-black">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md border border-black rounded-[10px] p-6 bg-white">
        <div className="mb-8">
          <h2 className="text-center text-2xl font-bold text-black">
            Connexion
          </h2>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="border border-black bg-white text-black p-4 rounded-[10px]">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Adresse email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-black rounded-[10px] text-black placeholder-black focus:outline-none"
                placeholder="Votre email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-black rounded-[10px] text-black placeholder-black focus:outline-none"
                placeholder="Votre mot de passe"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full px-4 py-2 border border-black text-black rounded-[10px] hover:bg-gray-50 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}