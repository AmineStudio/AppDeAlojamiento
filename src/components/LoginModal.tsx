import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { ADMIN_EMAILS } from '../config/admins';

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
      showToast('Please enter an email address.');
      return;
    }
    
    setLoading(true);
    try {
      if (mode === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
          await sendEmailVerification(userCredential.user);
          showToast('Please verify your email. A fresh link has been sent to your inbox.');
          await signOut(auth);
        } else {
          setLoginModalOpen(false);
          const emailLower = userCredential.user.email?.toLowerCase();
          if (emailLower && ADMIN_EMAILS.includes(emailLower)) {
            showToast('Welcome back, Admin! ☀️ Open Dashboard to manage your stays.');
          } else {
            showToast(`Welcome! Feel free to explore and request stays.`);
          }
        }
      } else if (mode === 'register') {
        if (password.length < 6) {
          showToast('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        await signOut(auth); // Sign out so they have to verify first
        showToast('Registration successful! Please check your email to verify your account.');
        setMode('login');
      } else if (mode === 'reset') {
        await sendPasswordResetEmail(auth, email);
        showToast('Password reset email sent! Check your inbox.');
        setMode('login');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        showToast('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        showToast('An account with this email already exists.');
      } else {
        showToast(err.message || 'Authentication failed.');
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
      const emailLower = userCredential.user.email?.toLowerCase();
      if (emailLower && ADMIN_EMAILS.includes(emailLower)) {
        showToast('Welcome back, Admin! ☀️ Open Dashboard to manage your stays.');
      } else {
        showToast(`Welcome! Feel free to explore and request stays.`);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        console.log('Login popup closed by user.');
      } else {
        showToast(err.message || 'Authentication failed.');
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
                Welcome to <span className="italic font-medium text-[#A7AB5E]">Mila</span>
              </h2>
              <p className="text-[#6E727C] mt-2 text-sm leading-relaxed">
                Sign in to request stays and connect with hosts.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full bg-white border border-[rgba(63,67,77,0.1)] py-3 px-4 rounded-xl text-sm outline-none"
                  required
                />
              </div>
              <div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-white border border-[rgba(63,67,77,0.1)] py-3 px-4 rounded-xl text-sm outline-none"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#3F434D] text-[#FBF7EC] py-3 rounded-full font-medium hover:bg-[#A7AB5E] transition-colors mt-2 disabled:opacity-70"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[rgba(63,67,77,0.1)]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#FBF7EC] text-[#6E727C]">Or continue with</span>
                </div>
              </div>

              <button 
                onClick={handleGoogleSignIn}
                className="mt-6 w-full bg-white border border-[rgba(63,67,77,0.1)] text-[#3F434D] py-3 rounded-full font-medium hover:bg-[rgba(0,0,0,0.02)] transition-colors flex items-center justify-center gap-2 shadow-sm"
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

            <div className="mt-4 flex flex-col items-center gap-2 text-sm">
              <button onClick={() => setMode('reset')} className="text-[#6E727C] hover:text-[#3F434D]">
                Forgot password?
              </button>
              <div className="text-[#6E727C]">
                Don't have an account?{' '}
                <button onClick={() => setMode('register')} className="text-[#A7AB5E] font-medium hover:underline">
                  Sign up
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
                Join <span className="italic font-medium text-[#A7AB5E]">Mila</span>
              </h2>
              <p className="text-[#6E727C] mt-2 text-sm leading-relaxed">
                Create an account to book your next stay.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full bg-white border border-[rgba(63,67,77,0.1)] py-3 px-4 rounded-xl text-sm outline-none"
                  required
                />
              </div>
              <div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min 6 characters)"
                  className="w-full bg-white border border-[rgba(63,67,77,0.1)] py-3 px-4 rounded-xl text-sm outline-none"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#3F434D] text-[#FBF7EC] py-3 rounded-full font-medium hover:bg-[#A7AB5E] transition-colors mt-2 disabled:opacity-70"
              >
                {loading ? 'Signing up...' : 'Sign up'}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[rgba(63,67,77,0.1)]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#FBF7EC] text-[#6E727C]">Or continue with</span>
                </div>
              </div>

              <button 
                onClick={handleGoogleSignIn}
                className="mt-6 w-full bg-white border border-[rgba(63,67,77,0.1)] text-[#3F434D] py-3 rounded-full font-medium hover:bg-[rgba(0,0,0,0.02)] transition-colors flex items-center justify-center gap-2 shadow-sm"
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

            <div className="mt-4 text-center text-sm text-[#6E727C]">
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className="text-[#A7AB5E] font-medium hover:underline">
                Sign in
              </button>
            </div>
          </>
        );
      case 'reset':
        return (
          <>
            <div className="text-center mb-6">
              <h2 className="font-display font-light text-2xl text-[#3F434D]">
                Reset Password
              </h2>
              <p className="text-[#6E727C] mt-2 text-sm leading-relaxed">
                Enter your email address to receive a password reset link.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full bg-white border border-[rgba(63,67,77,0.1)] py-3 px-4 rounded-xl text-sm outline-none"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#3F434D] text-[#FBF7EC] py-3 rounded-full font-medium hover:bg-[#A7AB5E] transition-colors mt-2 disabled:opacity-70"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <div className="mt-4 text-center text-sm">
              <button onClick={() => setMode('login')} className="text-[#6E727C] hover:text-[#3F434D] font-medium flex items-center justify-center gap-1 mx-auto">
                Back to Sign in
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
