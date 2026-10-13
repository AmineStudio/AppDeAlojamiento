import React, { useState } from 'react';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  sendPasswordResetEmail, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { isAdminEmail } from '../config/admins';

interface LoginModalProps {
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  showToast: (message: string) => void;
}

export function LoginModal({
  loginModalOpen,
  setLoginModalOpen,
  showToast
}: LoginModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!loginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Por favor introduce una dirección de correo.');
      return;
    }
    
    setLoading(true);
    try {
      if (mode === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
          await sendEmailVerification(userCredential.user);
          showToast('Por favor verifica tu correo. Hemos enviado un enlace de confirmación a tu bandeja de entrada.');
          await signOut(auth);
        } else {
          setLoginModalOpen(false);
          if (isAdminEmail(userCredential.user.email)) {
            showToast('¡Bienvenida de nuevo! ☀️ Abre el panel para gestionar tus alojamientos.');
          } else {
            showToast('¡Bienvenido! Explora los alojamientos disponibles y solicita tu estancia.');
          }
        }
      } else if (mode === 'register') {
        if (password.length < 6) {
          showToast('La contraseña debe tener al menos 6 caracteres.');
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        await signOut(auth);
        showToast('¡Registro completado! Por favor revisa tu correo electrónico para verificar tu cuenta.');
        setMode('login');
      } else if (mode === 'reset') {
        await sendPasswordResetEmail(auth, email);
        showToast('¡Enlace de recuperación enviado! Revisa tu bandeja de entrada.');
        setMode('login');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        showToast('Correo electrónico o contraseña incorrectos.');
      } else if (err.code === 'auth/email-already-in-use') {
        showToast('Ya existe una cuenta registrada con este correo.');
      } else {
        showToast(err.message || 'Error en la autenticación.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      setLoginModalOpen(false);
      if (isAdminEmail(userCredential.user.email)) {
        showToast('¡Bienvenida de nuevo! ☀️ Abre el panel para gestionar tus alojamientos.');
      } else {
        showToast('¡Bienvenido! Explora los alojamientos disponibles y solicita tu estancia.');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        console.log('Ventana de acceso con Google cerrada por el usuario.');
      } else {
        showToast(err.message || 'Error en la autenticación con Google.');
      }
    }
  };

  const renderContent = () => {
    switch (mode) {
      case 'login':
        return (
          <>
            <div className="text-center mb-6">
              <h2 className="font-display font-light text-3xl text-[#3F434D]">
                Acceso a <span className="italic font-medium text-[#A7AB5E]">Mila</span>
              </h2>
              <p className="text-[#6E727C] mt-2 text-xs leading-relaxed">
                Inicia sesión para reservar estancias o gestionar el portal de anfitriona.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correo electrónico"
                  className="w-full bg-white border border-[rgba(63,67,77,0.1)] py-3 px-4 rounded-xl text-sm outline-none focus:border-[#3D7A95]"
                  required
                />
              </div>
              <div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  className="w-full bg-white border border-[rgba(63,67,77,0.1)] py-3 px-4 rounded-xl text-sm outline-none focus:border-[#3D7A95]"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#3F434D] text-[#FBF7EC] py-3 rounded-full font-medium hover:bg-[#A7AB5E] transition-colors mt-2 disabled:opacity-70 shadow-sm"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[rgba(63,67,77,0.1)]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#FBF7EC] text-[#6E727C] text-xs">O continúa con</span>
                </div>
              </div>

              <button 
                onClick={handleGoogleSignIn}
                className="mt-6 w-full bg-white border border-[rgba(63,67,77,0.1)] text-[#3F434D] py-3 rounded-full font-medium hover:bg-[rgba(0,0,0,0.02)] transition-colors flex items-center justify-center gap-2 shadow-sm text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>
            </div>

            <div className="mt-4 flex flex-col items-center gap-2 text-xs">
              <button onClick={() => setMode('reset')} className="text-[#6E727C] hover:text-[#3F434D]">
                ¿Olvidaste tu contraseña?
              </button>
              <div className="text-[#6E727C]">
                ¿No tienes cuenta?{' '}
                <button onClick={() => setMode('register')} className="text-[#A7AB5E] font-semibold hover:underline">
                  Registrarse
                </button>
              </div>
            </div>
          </>
        );
      case 'register':
        return (
          <>
            <div className="text-center mb-6">
              <h2 className="font-display font-light text-3xl text-[#3F434D]">
                Únete a <span className="italic font-medium text-[#A7AB5E]">Mila</span>
              </h2>
              <p className="text-[#6E727C] mt-2 text-xs leading-relaxed">
                Crea una cuenta para solicitar estancias y chatear con la anfitriona.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correo electrónico"
                  className="w-full bg-white border border-[rgba(63,67,77,0.1)] py-3 px-4 rounded-xl text-sm outline-none focus:border-[#3D7A95]"
                  required
                />
              </div>
              <div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña (mínimo 6 caracteres)"
                  className="w-full bg-white border border-[rgba(63,67,77,0.1)] py-3 px-4 rounded-xl text-sm outline-none focus:border-[#3D7A95]"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#3F434D] text-[#FBF7EC] py-3 rounded-full font-medium hover:bg-[#A7AB5E] transition-colors mt-2 disabled:opacity-70 shadow-sm"
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[rgba(63,67,77,0.1)]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#FBF7EC] text-[#6E727C] text-xs">O continúa con</span>
                </div>
              </div>

              <button 
                onClick={handleGoogleSignIn}
                className="mt-6 w-full bg-white border border-[rgba(63,67,77,0.1)] text-[#3F434D] py-3 rounded-full font-medium hover:bg-[rgba(0,0,0,0.02)] transition-colors flex items-center justify-center gap-2 shadow-sm text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>
            </div>

            <div className="mt-4 text-center text-xs text-[#6E727C]">
              ¿Ya tienes cuenta?{' '}
              <button onClick={() => setMode('login')} className="text-[#A7AB5E] font-semibold hover:underline">
                Iniciar sesión
              </button>
            </div>
          </>
        );
      case 'reset':
        return (
          <>
            <div className="text-center mb-6">
              <h2 className="font-display font-light text-2xl text-[#3F434D]">
                Recuperar Contraseña
              </h2>
              <p className="text-[#6E727C] mt-2 text-xs leading-relaxed">
                Introduce tu correo electrónico para recibir un enlace de restablecimiento.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correo electrónico"
                  className="w-full bg-white border border-[rgba(63,67,77,0.1)] py-3 px-4 rounded-xl text-sm outline-none focus:border-[#3D7A95]"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#3F434D] text-[#FBF7EC] py-3 rounded-full font-medium hover:bg-[#A7AB5E] transition-colors mt-2 disabled:opacity-70 shadow-sm"
              >
                {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </button>
            </form>
            <div className="mt-4 text-center text-xs">
              <button onClick={() => setMode('login')} className="text-[#6E727C] hover:text-[#3F434D] font-medium">
                Volver a Iniciar sesión
              </button>
            </div>
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-filter backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#FBF7EC] border border-[rgba(63,67,77,0.1)] rounded-3xl p-6 relative shadow-2xl animate-scale-up">
        <button 
          onClick={() => {
            setLoginModalOpen(false);
            setMode('login');
            setEmail('');
            setPassword('');
          }}
          className="absolute top-4 right-4 h-8 w-8 hover:bg-[rgba(0,0,0,0.05)] rounded-full flex items-center justify-center text-md text-[#6E727C]"
        >
          ✕
        </button>
        {renderContent()}
      </div>
    </div>
  );
}
