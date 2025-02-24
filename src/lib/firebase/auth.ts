// src/lib/firebase/auth.ts
import { 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import { auth } from './config';
import { LoginFormData, AuthError } from '@/types/auth';

export const signIn = async (data: LoginFormData) => {
  try {
    const { email, password } = data;
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Obtenir le token ID avec un refresh forcé
    const idToken = await userCredential.user.getIdToken(true);
    
    // Créer le cookie de session
    const response = await fetch('/api/auth/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
      credentials: 'include' // S'assurer que les cookies sont envoyés et reçus
    });

    if (!response.ok) {
      throw new Error('Failed to create session');
    }

    return { user: userCredential.user, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return { user: null, error: error as AuthError };
  }
};

export const signOut = async () => {
  try {
    // Force d'abord une suppression du cookie de session côté serveur
    await fetch('/api/auth/session', {
      method: 'DELETE',
      credentials: 'include'
    });
    
    // Puis déconnexion de Firebase Auth
    await firebaseSignOut(auth);
    
    // Nettoyage supplémentaire du stockage local si nécessaire
    localStorage.removeItem('firebaseLastLogin');
    
    // Redirection après déconnexion (optionnel)
    window.location.href = '/login';
    
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: error as AuthError };
  }
};