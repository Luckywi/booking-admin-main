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
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const [redirectTimeout, setRedirectTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fonction de redirection
  const redirectUser = (userData: any) => {
    if (userData?.role === 'super_admin') {
      router.push('/dashboard/admins');
    } else if (userData?.role === 'admin' && userData.businessId) {
      router.push(`/dashboard/business/${userData.businessId}/appointments`);
    }
  };

  // Rediriger automatiquement l'utilisateur déjà connecté
  useEffect(() => {
    // Si la redirection a déjà été tentée, ne pas réessayer
    if (redirectAttempted) return;

    // Si l'authentification est encore en cours de chargement, attendre
    if (authLoading) return;

    // Si l'utilisateur est connecté et a des données, rediriger
    if (user && userData) {
      setRedirectAttempted(true);
      
      // Ajouter un délai de sécurité pour la redirection
      // Cela permet d'éviter les problèmes de timing avec Firebase Auth
      const timeout = setTimeout(() => {
        redirectUser(userData);
      }, 500);
      
      setRedirectTimeout(timeout);
    } else if (!authLoading && !user) {
      // Si l'authentification est terminée et qu'il n'y a pas d'utilisateur,
      // marquer qu'une tentative de redirection a été faite
      setRedirectAttempted(true);
    }

    // Nettoyer le timeout si le composant est démonté
    return () => {
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, [user, userData, authLoading, router, redirectAttempted]);

  // Réinitialiser l'état de redirection si l'URL change
  useEffect(() => {
    return () => {
      setRedirectAttempted(false);
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, []);

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
        
        if (userData) {
          // Réinitialiser le flag de redirection pour permettre la redirection après login
          setRedirectAttempted(false);
          redirectUser(userData);
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

  // Utiliser un temps de chargement maximum pour éviter le chargement infini
  useEffect(() => {
    const maxLoadingTime = setTimeout(() => {
      if (authLoading) {
        console.log("Loading timeout reached, forcing UI refresh");
        setRedirectAttempted(true);
      }
    }, 5000); // 5 secondes maximum de chargement

    return () => clearTimeout(maxLoadingTime);
  }, [authLoading]);

  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (authLoading && !redirectAttempted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-[10px] h-32 w-32 border-2 border-black"></div>
          <p className="mt-4 text-black">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est déjà connecté, ne pas afficher le formulaire (il sera redirigé)
  if (user && userData && !redirectAttempted) {
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