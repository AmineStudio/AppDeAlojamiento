import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { ADMIN_EMAILS } from '../config/admins';

interface UserInfo {
  name: string;
  email: string;
  role: 'guest' | 'host';
}

interface AuthContextType {
  user: UserInfo | null;
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  triggerLoginModal: (tab?: 'signin' | 'signup') => void;
  logout: () => void;
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Escuchar cambios de sesión automáticamente
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const email = firebaseUser.email || '';
        // Validamos si es Admin/Host basado en el email
        const role = ADMIN_EMAILS.includes(email) ? 'host' : 'guest';
        setUser({
          name: firebaseUser.displayName || email.split('@')[0],
          email: email,
          role: role
        });
      } else {
        setUser(null);
      }
    });
    
    return () => unsubscribe();
  }, []);

  const triggerLoginModal = (tab?: 'signin' | 'signup') => {
    // Si necesitas manejar el tab inicial, podrías guardarlo en un estado extra, 
    // pero por ahora abrimos el modal
    setLoginModalOpen(true);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setLoginModalOpen(false);
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loginModalOpen, 
      setLoginModalOpen, 
      triggerLoginModal, 
      logout, 
      loginWithGoogle 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
