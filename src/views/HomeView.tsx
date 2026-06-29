import React from 'react';
import { Heart, Star } from 'lucide-react';
import { House } from '../types';

interface HomeViewProps {
  houses: House[];
  handleNavigate: (page: 'home' | 'detail' | 'blog' | 'contact' | 'dashboard') => void;
  handleHouseClick: (houseId: string) => void;
  showToast: (msg: string) => void;
}

export function HomeView({ houses, handleNavigate, handleHouseClick, showToast }: HomeViewProps) {
  return (
    <div className="animate-fade-in">
      {/* Hero display block */}
      <section className="relative overflow-hidden py-24 sm:py-32 px-4 sm:px-8 bg-gradient-to-b from-[#F3ECDA] via-[#FBF7EC] to-[#FBF7EC]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E6BE7A] rounded-full filter blur-[150px] opacity-15 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#5BA6C4] rounded-full filter blur-[130px] opacity-15 pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
          <span className="inline-flex items-center gap-2 bg-white px-4 py-2 border border-[rgba(63,67,77,0.1)] rounded-full text-xs font-semibold uppercase tracking-widest text-[#3F434D] mb-6">
            <span className="h-2 w-2 rounded-full bg-[#A7AB5E] animate-ping"></span>
            Gran Canaria shared nomad stays
          </span>
          
          <h1 className="font-display font-light text-5xl sm:text-7xl lg:text-8xl tracking-tight text-[#3F434D] leading-tight mb-8">
            Live where the <br />
            <span className="italic font-medium text-[#A7AB5E] underline decoration-wavy decoration-[#E6BE7A] underline-offset-8">Atlantic</span> inspires.
          </h1>

          <p className="text-[#6E727C] text-lg sm:text-xl font-light leading-relaxed max-w-xl mb-10">
            Two custom shared homes nestled in vibrant Calle León y Castillo, Las Palmas, and the serene university area of Tafira Baja.
          </p>

          <div className="flex gap-4 flex-wrap justify-center mb-16">
            <a href="#stays" className="py-3 px-8 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#A7AB5E] text-[#FBF7EC] hover:bg-[#888B47] shadow-xl hover:shadow-2xl transition-all duration-300">
              Explore Stays
            </a>
            <button onClick={() => handleNavigate('blog')} className="py-3 px-8 rounded-full text-xs font-semibold uppercase tracking-wider bg-white text-[#3F434D] border border-[rgba(63,67,77,0.1)] hover:bg-[#F5EFE0] transition-all duration-300">
              Read local travel logs
            </button>
          </div>

          {/* Hero Statistics */}
          <div className="grid grid-cols-3 gap-8 sm:gap-16 border-t border-[rgba(63,67,77,0.08)] pt-12 w-full max-w-2xl">
            <div>
              <h5 className="font-display text-3xl sm:text-4xl font-extrabold text-[#3D7A95] tracking-tight">2</h5>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#6E727C] mt-2">Shared Homes</p>
            </div>
            <div>
              <h5 className="font-display text-3xl sm:text-4xl font-extrabold text-[#A7AB5E] tracking-tight">4.92</h5>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#6E727C] mt-2">Average Rating</p>
            </div>
            <div>
              <h5 className="font-display text-3xl sm:text-4xl font-extrabold text-[#3F434D] tracking-tight">100%</h5>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#6E727C] mt-2">Island Crafted</p>
            </div>
          </div>
        </div>
      </section>

      {/* Ocean bottom wave separator */}
      <div className="w-full overflow-hidden leading-none bg-[#FBF7EC]">
        <svg className="relative block w-full h-[60px]" viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0,30 C360,0 720,60 1080,30 C1380,10 1440,30 1440,30 L1440,60 L0,60 Z" fill="#ffffff" />
        </svg>
      </div>

      {/* List and filters segment */}
      <section id="stays" className="bg-white py-16 px-4 sm:px-6 lg:px-8 border-b border-[rgba(63,67,77,0.06)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 border-b border-[rgba(63,67,77,0.06)] pb-8">
            <div>
              <h2 className="font-display text-3xl sm:text-5xl font-light text-[#3F434D] tracking-tight">
                Mila’s <span className="italic font-normal text-[#A7AB5E]">Shared Houses</span>
              </h2>
              <p className="text-sm text-[#6E727C] mt-2 max-w-md font-light">
                Two destinations with a relaxed, shared living experience. Beautifully restored to connect and live comfortably.
              </p>
            </div>
          </div>

          {/* Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {houses.map((h) => (
              <div 
                key={h.id} 
                onClick={() => handleHouseClick(h.id)}
                className="group cursor-pointer bg-[#FBF7EC] rounded-3xl overflow-hidden border border-[rgba(63,67,77,0.06)] hover:shadow-2xl transition-all duration-300 flex flex-col h-full"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-200">
                  <img 
                    src={h.images[0]} 
                    alt={h.name} 
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  />
                  {h.tag && (
                    <span className="absolute top-4 left-4 bg-white text-[#3F434D] font-bold text-[10px] tracking-wider uppercase py-1.5 px-3 rounded-full shadow-md border border-[rgba(63,67,77,0.04)]">
                      {h.tag}
                    </span>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); showToast('❤️ Saved to favorites.'); }}
                    className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white flex items-center justify-center shadow-md text-[#6E727C] hover:text-[#888B47] hover:scale-105 transition-all"
                  >
                    <Heart className="h-4.5 w-4.5" />
                  </button>
                </div>

                <div className="p-6 flex flex-col flex-grow justify-between">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-[#3D7A95] uppercase block mb-1.5">📍 {h.location}</span>
                    <h3 className="font-display font-medium text-xl sm:text-2xl text-[#3F434D] group-hover:text-[#A7AB5E] transition-colors leading-6 mb-2.5">
                      {h.name}
                    </h3>
                    <p className="text-xs font-light text-[#6E727C] leading-relaxed mb-6 line-clamp-2">
                      {h.description}
                    </p>
                  </div>

                  <div className="border-t border-[rgba(63,67,77,0.06)] pt-4 flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-xl font-bold text-[#3F434D]">€{h.pricePerNight}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E727C]">/ night</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3F434D]">
                      <Star className="h-4 w-4 text-[#E6BE7A] fill-[#E6BE7A]" />
                      {h.rating} <span className="text-[#6E727C] font-normal">({h.reviewCount})</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
