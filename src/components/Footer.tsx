import React from 'react';
import { Send } from 'lucide-react';
import { MilaLogo } from './MilaLogo';
import { House } from '../types';

interface FooterProps {
  houses?: House[];
  handleNavigate: (page: 'home' | 'detail' | 'blog' | 'contact' | 'dashboard') => void;
  handleHouseClick: (houseId: string) => void;
  showToast: (msg: string) => void;
}

export function Footer({ houses = [], handleNavigate, handleHouseClick, showToast }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#3F434D] text-[#F3ECDA]/70 pt-20 pb-10 px-4 sm:px-6 lg:px-8 border-t border-[rgba(255,255,255,0.05)] mt-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3.5">
            <MilaLogo className="h-11 w-auto" />
            <span className="font-display font-medium text-lg leading-4 tracking-wider uppercase text-white">M.I.L.A</span>
          </div>
          <p className="text-xs font-light leading-relaxed max-w-xs text-[#F3ECDA]/60">
            Alojamientos compartidos para nómadas digitales y estudiantes. Espacios concebidos para conectar, trabajar con calma y disfrutar de Gran Canaria.
          </p>
        </div>
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-4">Alojamientos</h4>
          <ul className="space-y-2 text-xs">
            {houses.map((house) => (
              <li key={house.id}>
                <button 
                  onClick={() => handleHouseClick(house.id)} 
                  className="hover:text-white transition-colors text-left"
                >
                  {house.name}
                </button>
              </li>
            ))}
            {houses.length === 0 && (
              <li className="text-[#F3ECDA]/40 italic">Cargando alojamientos...</li>
            )}
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-4">Navegación</h4>
          <ul className="space-y-2 text-xs">
            <li><button onClick={() => handleNavigate('home')} className="hover:text-white transition-colors">Catálogo de estancias</button></li>
            <li><button onClick={() => handleNavigate('blog')} className="hover:text-white transition-colors">Historias y consejos locales</button></li>
            <li><button onClick={() => handleNavigate('contact')} className="hover:text-white transition-colors">Contactar con la anfitriona</button></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-4">Boletín Nómada</h4>
          <p className="text-xs font-light text-[#F3ECDA]/60 mb-2 leading-relaxed">Suscríbete para recibir eventos locales y novedades.</p>
          <div className="flex gap-2">
            <input type="email" placeholder="tu@correo.com" className="bg-white/10 text-white placeholder-white/30 text-xs px-4 py-2.5 rounded-full outline-none focus:bg-white/20 w-full" />
            <button onClick={() => showToast('💌 ¡Te has suscrito correctamente!')} className="p-3 bg-[#A7AB5E] text-white rounded-full hover:bg-[#888B47] transition-all" title="Suscribirme">
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-[rgba(255,255,255,0.06)] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-[#F3ECDA]/40">
        <span>© {currentYear} M.I.L.A Coliving · Estancias en Gran Canaria</span>
        <span>Diseñado para viajeros auténticos con dedicación absoluta</span>
      </div>
    </footer>
  );
}
