import React from 'react';
import { Send } from 'lucide-react';
import { MilaLogo } from './MilaLogo';

interface FooterProps {
  handleNavigate: (page: 'home' | 'detail' | 'blog' | 'contact' | 'dashboard') => void;
  handleHouseClick: (houseId: string) => void;
  showToast: (msg: string) => void;
}

export function Footer({ handleNavigate, handleHouseClick, showToast }: FooterProps) {
  return (
    <footer className="bg-[#3F434D] text-[#F3ECDA]/70 pt-20 pb-10 px-4 sm:px-6 lg:px-8 border-t border-[rgba(255,255,255,0.05)] mt-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3.5">
            <MilaLogo className="h-11 w-auto" />
            <span className="font-display font-medium text-lg leading-4 tracking-wider uppercase text-white">M.I.L.A</span>
          </div>
          <p className="text-xs font-light leading-relaxed max-w-xs text-[#F3ECDA]/60">
            Two shared nomad houses. Conceived for authentic connections, focused work, and peaceful living in Gran Canaria.
          </p>
        </div>
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-4">The Houses</h4>
          <ul className="space-y-2 text-xs">
            <li><button onClick={() => handleHouseClick('leon-y-castillo')} className="hover:text-white transition-colors">Casa Compartida León y Castillo</button></li>
            <li><button onClick={() => handleHouseClick('tafira-baja')} className="hover:text-white transition-colors">Casa Compartida Tafira Baja</button></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-4">Navigations</h4>
          <ul className="space-y-2 text-xs">
            <li><button onClick={() => handleNavigate('home')} className="hover:text-white transition-colors">Shared stays catalog</button></li>
            <li><button onClick={() => handleNavigate('blog')} className="hover:text-white transition-colors">Travel logs & stories</button></li>
            <li><button onClick={() => handleNavigate('contact')} className="hover:text-white transition-colors">Talk directly with Mila</button></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-4">Nomad Guide</h4>
          <p className="text-xs font-light text-[#F3ECDA]/60 mb-2 leading-relaxed">Join Stays to access weekly surf reports and local meetups.</p>
          <div className="flex gap-2">
            <input type="email" placeholder="nomad@example.com" className="bg-white/10 text-white placeholder-white/30 text-xs px-4 py-2.5 rounded-full outline-none focus:bg-white/20 w-full" />
            <button onClick={() => showToast('💌 Subscribed successfully!')} className="p-3 bg-[#A7AB5E] text-white rounded-full hover:bg-[#888B47] transition-all">
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-[rgba(255,255,255,0.06)] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-[#F3ECDA]/40">
        <span>© 2026 M.I.L.A Nomad Rooms · Gran Canaria stays</span>
        <span>Crafted for true travelers with absolute dedication</span>
      </div>
    </footer>
  );
}
