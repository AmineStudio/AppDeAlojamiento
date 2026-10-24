import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, TrendingUp, Star, LogOut, MessageSquare } from 'lucide-react';
import { MilaLogo } from './MilaLogo';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import textos from '../content/textos.json';

interface NavigationProps {
  currentPage?: string;
  user?: { name: string; email: string; role: 'guest' | 'host' } | null;
  userDropdownOpen?: boolean;
  setUserDropdownOpen?: (open: boolean) => void;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
  handleNavigate?: (page: 'home' | 'detail' | 'blog' | 'contact' | 'dashboard' | 'inbox') => void;
  triggerLoginModal?: (tab: 'signin' | 'signup') => void;
  executeSignOut?: () => void;
  showToast?: (msg: string) => void;
}

export function Navigation(props: NavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: ctxUser, triggerLoginModal: ctxTriggerLoginModal, logout } = useAuth();
  const { showToast: ctxShowToast } = useToast();
  const tNav = textos.nav;

  const user = props.user !== undefined ? props.user : ctxUser;
  const triggerLoginModal = props.triggerLoginModal || ctxTriggerLoginModal;
  const showToast = props.showToast || ctxShowToast;

  const [localDropdown, setLocalDropdown] = useState(false);
  const userDropdownOpen = props.userDropdownOpen !== undefined ? props.userDropdownOpen : localDropdown;
  const setUserDropdownOpen = props.setUserDropdownOpen || setLocalDropdown;

  const [localMobile, setLocalMobile] = useState(false);
  const mobileMenuOpen = props.mobileMenuOpen !== undefined ? props.mobileMenuOpen : localMobile;
  const setMobileMenuOpen = props.setMobileMenuOpen || setLocalMobile;

  const executeSignOut = props.executeSignOut || (async () => {
    try {
      await logout();
      setUserDropdownOpen(false);
      navigate('/');
      showToast(tNav.signOutSuccess);
    } catch (err: any) {
      showToast(err.message || tNav.signOutError);
    }
  });

  const onNav = (page: 'home' | 'detail' | 'blog' | 'contact' | 'dashboard' | 'inbox') => {
    if (page === 'dashboard') {
      if (!user || user.role !== 'host') {
        showToast(tNav.hostRestrictedToast);
        triggerLoginModal('signin');
        return;
      }
      navigate('/panel');
    } else if (page === 'inbox') {
      navigate('/mensajes');
    } else {
      const sectionMap: Record<string, string> = {
        home: 'stays',
        blog: 'stories',
        contact: 'contact',
        detail: 'stays',
      };
      const sectionId = sectionMap[page];
      if (location.pathname === '/') {
        const el = sectionId ? document.getElementById(sectionId) : null;
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        navigate(`/#${sectionId || ''}`);
      }
    }
    
    if (props.handleNavigate) {
      props.handleNavigate(page);
    }
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-[rgba(250,246,236,0.92)] backdrop-blur-xl border-b border-[rgba(63,67,77,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo area */}
          <div className="flex items-center gap-3.5 cursor-pointer group" onClick={() => onNav('home')}>
            <MilaLogo className="h-11 w-auto transform transition-all duration-300 group-hover:scale-105" />
            <div className="flex flex-col">
              <span className="font-display font-medium text-lg leading-4 tracking-wider uppercase text-[#3F434D]">M.I.L.A</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#3D7A95]">{tNav.brandSubtitle}</span>
            </div>
          </div>

          {/* Desktop Navigation Links (Clean One-Page) */}
          <div className="hidden md:flex items-center gap-1 bg-[#F5EFE0] p-1.5 rounded-full border border-[rgba(63,67,77,0.06)] shadow-inner">
            <button 
              onClick={() => onNav('home')} 
              className="py-2 px-5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#6E727C] hover:text-[#3F434D] hover:bg-white/60 transition-all duration-200"
            >
              {tNav.stays}
            </button>
            <button 
              onClick={() => onNav('blog')} 
              className="py-2 px-5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#6E727C] hover:text-[#3F434D] hover:bg-white/60 transition-all duration-200"
            >
              {tNav.stories}
            </button>
            <button 
              onClick={() => onNav('contact')} 
              className="py-2 px-5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#6E727C] hover:text-[#3F434D] hover:bg-white/60 transition-all duration-200"
            >
              {tNav.contact}
            </button>
          </div>

          {/* User action chips in Navbar */}
          <div className="flex items-center gap-3 relative">
            <div className="hidden md:flex items-center gap-3">
              {!user ? (
                <>
                  <button onClick={() => triggerLoginModal('signin')} className="text-xs font-semibold uppercase tracking-wider text-[#6E727C] hover:text-[#3F434D] py-2 px-4 transition-colors">
                    {tNav.signIn}
                  </button>
                  <button onClick={() => triggerLoginModal('signup')} className="py-2.5 px-6 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#A7AB5E] text-[#FBF7EC] hover:bg-[#888B47] shadow-sm hover:shadow transition-all duration-200">
                    {tNav.signUp}
                  </button>
                </>
              ) : (
                <>
                  <div 
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 bg-[#F5EFE0] p-1.5 pr-4 rounded-full border border-[rgba(63,67,77,0.1)] cursor-pointer hover:border-[#3D7A95] transition-all"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#A7AB5E] to-[#E6BE7A] text-white flex items-center justify-center font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold leading-3 text-[#3F434D]">{user.name}</span>
                      <span className="text-[9px] uppercase tracking-wider font-bold text-[#3D7A95]">
                        {user.role === 'host' ? tNav.roleHost : tNav.roleGuest}
                      </span>
                    </div>
                  </div>

                  {userDropdownOpen && (
                    <div className="absolute right-0 top-14 w-52 bg-[#FBF7EC] border border-[rgba(63,67,77,0.1)] rounded-2xl shadow-xl py-2 z-50 text-sm overflow-hidden">
                      {user.role === 'host' ? (
                        <button onClick={() => { onNav('dashboard'); setUserDropdownOpen(false); }} className="w-full text-left py-2.5 px-5 hover:bg-[#F5EFE0] flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                          <TrendingUp className="h-4 w-4 text-[#3D7A95]" /> {tNav.hostDashboard}
                        </button>
                      ) : (
                        <>
                          <button onClick={() => { onNav('inbox'); setUserDropdownOpen(false); }} className="w-full text-left py-2.5 px-5 hover:bg-[#F5EFE0] flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                            <MessageSquare className="h-4 w-4 text-[#3D7A95]" /> {tNav.myMessages}
                          </button>
                          <button onClick={() => { onNav('home'); setUserDropdownOpen(false); }} className="w-full text-left py-2.5 px-5 hover:bg-[#F5EFE0] flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                            <Star className="h-4 w-4 text-[#A7AB5E]" /> {tNav.writeReview}
                          </button>
                        </>
                      )}
                      <div className="border-t border-[rgba(63,67,77,0.06)] my-1.5"></div>
                      <button onClick={executeSignOut} className="w-full text-left py-2.5 px-5 hover:bg-orange-50 text-[#888B47] flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                        <LogOut className="h-4 w-4" /> {tNav.signOut}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex md:hidden items-center">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="text-[#3F434D] p-2 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FBF7EC] border-b border-[rgba(63,67,77,0.1)] py-4 px-4 sm:px-6 shadow-lg">
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => onNav('home')} 
              className="text-left text-sm font-semibold uppercase tracking-wider text-[#3F434D]"
            >
              {tNav.stays}
            </button>
            <button 
              onClick={() => onNav('blog')} 
              className="text-left text-sm font-semibold uppercase tracking-wider text-[#3F434D]"
            >
              {tNav.stories}
            </button>
            <button 
              onClick={() => onNav('contact')} 
              className="text-left text-sm font-semibold uppercase tracking-wider text-[#3F434D]"
            >
              {tNav.contact}
            </button>
            
            <div className="border-t border-[rgba(63,67,77,0.1)] my-2"></div>
            
            {!user ? (
              <>
                <button onClick={() => { triggerLoginModal('signin'); setMobileMenuOpen(false); }} className="text-left text-sm font-semibold uppercase tracking-wider text-[#6E727C]">
                  {tNav.signIn}
                </button>
                <button onClick={() => { triggerLoginModal('signup'); setMobileMenuOpen(false); }} className="text-left text-sm font-semibold uppercase tracking-wider text-[#A7AB5E]">
                  {tNav.signUp}
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#A7AB5E] to-[#E6BE7A] text-white flex items-center justify-center font-bold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[#3F434D]">{user.name}</span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#3D7A95]">
                      {user.role === 'host' ? tNav.roleHost : tNav.roleGuest}
                    </span>
                  </div>
                </div>
                
                {user.role === 'host' ? (
                  <button onClick={() => onNav('dashboard')} className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#3D7A95]">
                    <TrendingUp className="h-4 w-4" /> {tNav.hostDashboard}
                  </button>
                ) : (
                  <>
                    <button onClick={() => onNav('inbox')} className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#3D7A95]">
                      <MessageSquare className="h-4 w-4" /> {tNav.myMessages}
                    </button>
                    <button onClick={() => onNav('home')} className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#A7AB5E]">
                      <Star className="h-4 w-4" /> {tNav.writeReview}
                    </button>
                  </>
                )}
                <button onClick={executeSignOut} className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#888B47] mt-2">
                  <LogOut className="h-4 w-4" /> {tNav.signOut}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
