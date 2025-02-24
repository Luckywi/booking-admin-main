'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { getUserData } from '@/lib/firebase/firestore';
import { UserData } from '@/types/auth';

type AuthContextType = {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  refreshUserData: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  refreshUserData: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour rafraîchir les données utilisateur
  const refreshUserData = async () => {
    if (user) {
      try {
        const data = await getUserData(user.uid);
        setUserData(data);
      } catch (error) {
        console.error("Error refreshing user data:", error);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!isMounted) return;
      
      setLoading(true);
      
      try {
        if (currentUser) {
          // Vérifier si le token est valide (sera expiré si cookie de session supprimé)
          const tokenResult = await currentUser.getIdTokenResult(true);
          
          if (tokenResult) {
            setUser(currentUser);
            const data = await getUserData(currentUser.uid);
            setUserData(data);
          } else {
            // Token invalide, déconnexion
            setUser(null);
            setUserData(null);
          }
        } else {
          setUser(null);
          setUserData(null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        // En cas d'erreur, réinitialiser l'état
        setUser(null);
        setUserData(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
}