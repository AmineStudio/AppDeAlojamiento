import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import { MilaLogo } from './MilaLogo';
import { House } from '../types';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';
import textos from '../content/textos.json';

interface FooterProps {
  houses?: House[];
  handleNavigate?: (page: 'home' | 'detail' | 'blog' | 'contact' | 'dashboard') => void;
  handleHouseClick?: (houseId: string) => void;
  showToast?: (msg: string) => void;
}

export function Footer(props: FooterProps) {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const { houses: ctxHouses } = useData();
  const { showToast: ctxShowToast } = useToast();
  const tFoot = textos.footer;

  const houses = props.houses || ctxHouses;
  const showToast = props.showToast || ctxShowToast;

  const onHouseClick = (houseId: string) => {
    if (props.handleHouseClick) {
      props.handleHouseClick(houseId);
    } else {
      navigate(`/alojamiento/${houseId}`);
    }
  };

  const onNavigate = (page: 'home' | 'detail' | 'blog' | 'contact' | 'dashboard') => {
    if (page === 'home') navigate('/');
    else if (page === 'blog') navigate('/historias');
    else if (page === 'contact') navigate('/contacto');
    else if (page === 'dashboard') navigate('/panel');
    else if (page === 'detail') navigate('/');
    
    if (props.handleNavigate) {
      props.handleNavigate(page);
    }
  };

  return (
    <footer className="bg-[#3F434D] text-[#F3ECDA]/70 pt-20 pb-10 px-4 sm:px-6 lg:px-8 border-t border-[rgba(255,255,255,0.05)] mt-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => onNavigate('home')}>
            <MilaLogo className="h-11 w-auto" />
            <span className="font-display font-medium text-lg leading-4 tracking-wider uppercase text-white">M.I.L.A</span>
          </div>
          <p className="text-xs font-light leading-relaxed max-w-xs text-[#F3ECDA]/60">
            {tFoot.tagline}
          </p>
        </div>
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-4">{tFoot.staysTitle}</h4>
          <ul className="space-y-2 text-xs">
            {houses.map((house) => (
              <li key={house.id}>
                <button 
                  onClick={() => onHouseClick(house.id)} 
                  className="hover:text-white transition-colors text-left"
                >
                  {house.name}
                </button>
              </li>
            ))}
            {houses.length === 0 && (
              <li className="text-[#F3ECDA]/40 italic">{tFoot.loadingStays}</li>
            )}
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-4">{tFoot.navigationTitle}</h4>
          <ul className="space-y-2 text-xs">
            <li><button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">{tFoot.catalogLink}</button></li>
            <li><button onClick={() => onNavigate('blog')} className="hover:text-white transition-colors">{tFoot.storiesLink}</button></li>
            <li><button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">{tFoot.contactLink}</button></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-4">{tFoot.newsletterTitle}</h4>
          <p className="text-xs font-light text-[#F3ECDA]/60 mb-2 leading-relaxed">{tFoot.newsletterDesc}</p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder={tFoot.newsletterPlaceholder} 
              className="bg-white/10 text-white placeholder-white/30 text-xs px-4 py-2.5 rounded-full outline-none focus:bg-white/20 w-full" 
            />
            <button 
              onClick={() => showToast(tFoot.newsletterToast)} 
              className="p-3 bg-[#A7AB5E] text-white rounded-full hover:bg-[#888B47] transition-all" 
              title={tFoot.newsletterButtonTitle}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-[rgba(255,255,255,0.06)] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-[#F3ECDA]/40">
        <span>© {currentYear} {tFoot.copyright}</span>
        <span>{tFoot.craftNote}</span>
      </div>
    </footer>
  );
}
