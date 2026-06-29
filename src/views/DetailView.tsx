import React from 'react';
import { Users, FileText, Star, Calendar as CalendarIcon } from 'lucide-react';
import { House, Room, GuestReview } from '../types';

interface DetailViewProps {
  handleNavigate: (page: 'home' | 'detail' | 'blog' | 'contact' | 'dashboard' | 'inbox') => void;
  activeHouse: House;
  showToast: (msg: string) => void;
  roomsByHouse: Record<string, Room[]>;
  checkInDate: Date | null;
  setCheckInDate: (d: Date | null) => void;
  checkOutDate: Date | null;
  setCheckOutDate: (d: Date | null) => void;
  reviewsByHouse: Record<string, GuestReview[]>;
  calendarOpen: boolean;
  setCalendarOpen: (open: boolean) => void;
  currentCalMonth: Date;
  setCurrentCalMonth: React.Dispatch<React.SetStateAction<Date>>;
  dateToKey: (d: Date) => string;
  isDatePast: (d: Date) => boolean;
  isDateBooked: (d: Date) => boolean;
  selectDate: (d: Date) => void;
  guestCount: number;
  setGuestCount: (count: number) => void;
  triggerBookingSuccess: () => void;
  getSubtotal: () => number;
  getDaysCount: () => number;
  user: { name: string; email: string; role: 'host' | 'guest' } | null;
  handleAddReview: (houseId: string, rating: number, comment: string) => void;
  canReview: boolean;
}

export function DetailView({
  handleNavigate,
  activeHouse,
  showToast,
  roomsByHouse,
  checkInDate,
  setCheckInDate,
  checkOutDate,
  setCheckOutDate,
  reviewsByHouse,
  calendarOpen,
  setCalendarOpen,
  currentCalMonth,
  setCurrentCalMonth,
  dateToKey,
  isDatePast,
  isDateBooked,
  selectDate,
  guestCount,
  setGuestCount,
  triggerBookingSuccess,
  getSubtotal,
  getDaysCount,
  user,
  handleAddReview,
  canReview
}: DetailViewProps) {
  const [newReviewRating, setNewReviewRating] = React.useState(5);
  const [newReviewText, setNewReviewText] = React.useState('');

  const submitReview = () => {
    if (!newReviewText.trim()) {
      showToast('Please write a review text');
      return;
    }
    handleAddReview(activeHouse.id, newReviewRating, newReviewText);
    setNewReviewText('');
    setNewReviewRating(5);
  };
  return (
    <div className="animate-fade-in py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Back breadcrumb navigation */}
        <button 
          onClick={() => handleNavigate('home')}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6E727C] hover:text-[#3F434D] mb-8"
        >
          ← Back to listings
        </button>

        {/* Title & Stats */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6 mb-8">
          <div>
            <span className="text-xs font-bold tracking-widest text-[#3D7A95] uppercase block mb-1">📍 {activeHouse.location}</span>
            <h1 className="font-display font-light text-3xl sm:text-5xl text-[#3F434D] tracking-tight">{activeHouse.name}</h1>
            
            <div className="flex items-center gap-4 flex-wrap text-xs text-[#6E727C] font-medium mt-3 border-t border-[rgba(63,67,77,0.06)] pt-3">
              <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Max {activeHouse.guests} guests</span>
              <span>•</span>
              <span><FileText className="h-3.5 w-3.5 inline mr-1" /> {activeHouse.beds}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-[#E6BE7A] fill-[#E6BE7A]" /> 
                <strong>{activeHouse.rating}</strong> ({activeHouse.reviewCount} customer reviews)
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => showToast('❤️ Saved to favorites')} className="py-2.5 px-6 bg-white border border-[rgba(63,67,77,0.1)] hover:bg-[#F5EFE0] rounded-full text-xs font-semibold uppercase tracking-wider text-[#3F434D] transition-all">
              ♡ Favorite
            </button>
            <button onClick={() => showToast('↗️ Link copied to clipboard!')} className="py-2.5 px-6 bg-white border border-[rgba(63,67,77,0.1)] hover:bg-[#F5EFE0] rounded-full text-xs font-semibold uppercase tracking-wider text-[#3F434D] transition-all">
              ↗️ Share Stay
            </button>
          </div>
        </div>

        {/* High-Fidelity Custom Layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left hand content (Story + Rooms + Amenities) */}
          <div className="lg:col-span-2">
            
            {/* Photo Gallery banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {activeHouse.images.map((img, idx) => (
                <div key={idx} className={`rounded-3xl overflow-hidden shadow-md w-full ${idx === 0 ? 'sm:col-span-2 aspect-[21/9]' : 'aspect-[4/3]'} max-h-[500px]`}>
                  <img src={img} alt="" className="object-cover h-full w-full transition-transform duration-500 hover:scale-[1.01]" />
                </div>
              ))}
            </div>

            {/* House Bio Description */}
            <div className="border-b border-[rgba(63,67,77,0.08)] pb-10 mb-10">
              <h3 className="font-display font-medium text-2xl text-[#3F434D] mb-4">About the estate</h3>
              <p className="text-sm font-light leading-relaxed text-[#6E727C] space-y-4">
                {activeHouse.description}
              </p>
            </div>

            {/* Amenities/Features section */}
            <div className="border-b border-[rgba(63,67,77,0.08)] pb-10 mb-10">
              <h3 className="font-display font-medium text-2xl text-[#3F434D] mb-6">Home Amenities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeHouse.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white border border-[rgba(63,67,77,0.06)] rounded-2xl p-4">
                    <div className="h-8 w-8 rounded-xl bg-[#CFE4EC] text-[#3D7A95] flex items-center justify-center font-bold text-sm">✓</div>
                    <span className="text-xs font-medium text-[#3F434D]">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Room options & Pricing */}
            <div className="border-b border-[rgba(63,67,77,0.08)] pb-10 mb-10">
              <h3 className="font-display font-medium text-2xl text-[#3F434D] mb-6">Choose your Room</h3>
              <div className="space-y-4">
                {(roomsByHouse[activeHouse.id] || []).map((r) => (
                  <div 
                    key={r.id} 
                    className={`flex flex-col gap-4 p-5 rounded-3xl bg-white border border-[rgba(63,67,77,0.06)] shadow-sm hover:border-[#3D7A95] transition-all duration-200 ${!r.available ? 'opacity-50' : ''}`}
                  >
                    <div className="flex gap-3 overflow-x-auto snap-x pb-2 w-full no-scrollbar">
                      {r.images.map((img, idx) => (
                        <img key={idx} src={img} alt={r.name} className="h-40 w-56 object-cover rounded-2xl shrink-0 snap-start" />
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h5 className="font-display font-medium text-lg text-[#3F434D]">{r.name}</h5>
                        <p className="text-sm text-[#6E727C] mt-1 max-w-xl">{r.description}</p>
                        <div className="flex gap-4 mt-3 text-[10px] font-bold text-[#3D7A95] uppercase tracking-wider">
                          <span>🛏️ {r.beds}</span>
                          <span>🌳 {r.view}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
                        <div className="text-right">
                          <span className="font-display text-lg font-bold text-[#3F434D] block">€{r.price}</span>
                          <span className="text-[9px] uppercase tracking-wider font-bold text-[#6E727C]">/ night</span>
                        </div>
                        <button 
                          onClick={() => {
                            setCheckInDate(new Date(2026, 5, 15));
                            setCheckOutDate(new Date(2026, 5, 20));
                            showToast(`✨ Selected dates pre-loaded for ${r.name}`);
                          }}
                          disabled={!r.available}
                          className={`py-2 px-5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${r.available ? 'bg-[#A7AB5E] text-white hover:bg-[#888B47]' : 'bg-gray-200 text-[#6E727C] cursor-not-allowed'}`}
                        >
                          {r.available ? 'Book Room' : 'Unavailable'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div>
              <h3 className="font-display font-medium text-2xl text-[#3F434D] mb-6">Guest Testimonials</h3>
              
              {/* Reviews breakdown widget */}
              <div className="bg-white border border-[rgba(63,67,77,0.06)] p-6 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-8">
                <div className="text-center md:border-r border-[rgba(63,67,77,0.08)] py-4">
                  <h4 className="font-display text-6xl font-light text-[#3D7A95] leading-none mb-2">{activeHouse.rating}</h4>
                  <div className="flex justify-center text-[#E6BE7A] font-bold text-md mb-2">★★★★★</div>
                  <span className="text-xs uppercase font-bold tracking-widest text-[#6E727C]">{activeHouse.reviewCount} total reviews</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#6E727C]">Cleanliness</span>
                    <div className="flex items-center gap-3 w-3/5">
                      <div className="h-1.5 w-full bg-[#F5EFE0] rounded-full overflow-hidden">
                        <div className="h-full bg-[#A7AB5E]" style={{ width: '96%' }}></div>
                      </div>
                      <span className="text-[#3F434D]">4.9</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#6E727C]">Location</span>
                    <div className="flex items-center gap-3 w-3/5">
                      <div className="h-1.5 w-full bg-[#F5EFE0] rounded-full overflow-hidden">
                        <div className="h-full bg-[#A7AB5E]" style={{ width: '98%' }}></div>
                      </div>
                      <span className="text-[#3F434D]">5.0</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#6E727C]">Value for money</span>
                    <div className="flex items-center gap-3 w-3/5">
                      <div className="h-1.5 w-full bg-[#F5EFE0] rounded-full overflow-hidden">
                        <div className="h-full bg-[#A7AB5E]" style={{ width: '92%' }}></div>
                      </div>
                      <span className="text-[#3F434D]">4.7</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#6E727C]">Host communication</span>
                    <div className="flex items-center gap-3 w-3/5">
                      <div className="h-1.5 w-full bg-[#F5EFE0] rounded-full overflow-hidden">
                        <div className="h-full bg-[#A7AB5E]" style={{ width: '96%' }}></div>
                      </div>
                      <span className="text-[#3F434D]">4.9</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Reviews Stream */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {(reviewsByHouse[activeHouse.id] || []).map((rev) => (
                  <div key={rev.id} className="p-5 bg-white border border-[rgba(63,67,77,0.06)] rounded-3xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 text-xs text-white rounded-full bg-gradient-to-tr from-[#3D7A95] to-[#E6BE7A] flex items-center justify-center font-bold">
                        {rev.authorName.charAt(0)}
                      </div>
                      <div>
                        <h6 className="text-xs font-bold uppercase tracking-wider text-[#3F434D]">{rev.authorName}</h6>
                        <span className="text-[10px] text-[#6E727C] block">{rev.date}</span>
                      </div>
                    </div>
                    <div className="flex gap-0.5 text-[#E6BE7A] text-xs mb-3">{"★".repeat(rev.rating)}</div>
                    <p className="text-xs font-light text-[#6E727C] leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>

              {/* Submit Review Box Container */}
              <div id="reviewFormWrap" className="mt-8">
                {canReview ? (
                  <div className="bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] rounded-3xl p-6">
                    <h4 className="font-display font-medium text-lg text-[#3F434D] mb-4">Write a Review</h4>
                    <div className="mb-4">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button 
                            key={star} 
                            onClick={() => setNewReviewRating(star)}
                            className={`text-xl transition-colors ${star <= newReviewRating ? 'text-[#E6BE7A]' : 'text-[#D1D5DB]'}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-2">Your Experience</label>
                      <textarea
                        value={newReviewText}
                        onChange={(e) => setNewReviewText(e.target.value)}
                        placeholder="Tell us about your stay..."
                        className="w-full bg-white border border-[rgba(63,67,77,0.1)] rounded-2xl p-4 text-sm focus:outline-none focus:border-[#3D7A95] min-h-[100px] resize-none"
                      ></textarea>
                    </div>
                    <button 
                      onClick={submitReview}
                      className="py-2.5 px-6 bg-[#3F434D] text-[#FBF7EC] hover:bg-[#1E2024] rounded-full text-xs font-semibold uppercase tracking-wider transition-colors"
                    >
                      Post Review
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Right hand booking sidebar card */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white border border-[rgba(63,67,77,0.1)] rounded-3xl p-6 shadow-xl">
              <div className="flex items-baseline gap-1.5 mb-6">
                <span className="font-display font-light text-4xl text-[#3F434D]">€{activeHouse.pricePerNight}</span>
                <span className="text-xs font-bold uppercase tracking-widest text-[#6E727C]">/ night</span>
              </div>

              {/* Custom Interactive Calendar Widget Input */}
              <div className="relative mb-4">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-2">Selected Dates</label>
                <div 
                  onClick={() => setCalendarOpen(!calendarOpen)}
                  className={`flex justify-between items-center bg-[#F5EFE0] py-3.5 px-4 rounded-2xl border transition-all cursor-pointer ${calendarOpen ? 'border-[#3D7A95] shadow-inner' : 'border-[rgba(63,67,77,0.08)]'}`}
                >
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-[#3D7A95]" />
                    <span className="text-xs font-medium text-[#3F434D]">
                      {checkInDate ? checkInDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) : 'Check in'}
                      {' → '}
                      {checkOutDate ? checkOutDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) : 'Check out'}
                    </span>
                  </div>
                  <span className="text-md text-[#6E727C]">▾</span>
                </div>

                {/* Custom Built React Calendar overlay */}
                {calendarOpen && (
                  <div className="absolute top-18 right-0 left-0 bg-white border border-[#3D7A95] rounded-3xl p-5 shadow-2xl z-40 animate-fade-in w-full max-w-sm">
                    <div className="grid grid-cols-1 gap-6">
                      
                      {/* Months grid loops dynamically */}
                      {Array.from({ length: 2 }).map((_, idx) => {
                        const targetMonth = new Date(currentCalMonth.getFullYear(), currentCalMonth.getMonth() + idx, 1);
                        const monthName = targetMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                        const firstDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
                        const lastDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
                        const startWeekday = (firstDay.getDay() + 6) % 7; // Mon=0
                        const daysInMonth = lastDay.getDate();

                        return (
                          <div key={idx}>
                            <div className="flex items-center justify-between mb-3">
                              {idx === 0 && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setCurrentCalMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)); }}
                                  className="h-7 w-7 rounded-full hover:bg-[#F5EFE0] flex items-center justify-center text-xs"
                                >
                                  ‹
                                </button>
                              )}
                              <span className="text-xs font-bold uppercase tracking-wider text-[#3F434D] mx-auto">{monthName}</span>
                              {idx === 1 && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setCurrentCalMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)); }}
                                  className="h-7 w-7 rounded-full hover:bg-[#F5EFE0] flex items-center justify-center text-xs"
                                >
                                  ›
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center">
                              {['M','T','W','T','F','S','S'].map((d, dIdx) => (
                                <div key={`${d}-${dIdx}`} className="text-[9px] font-bold text-[#6E727C] py-1">{d}</div>
                              ))}
                              {Array.from({ length: startWeekday }).map((_, i) => (
                                <div key={i} className="aspect-square"></div>
                              ))}
                              {Array.from({ length: daysInMonth }).map((_, dIdx) => {
                                const dayNum = dIdx + 1;
                                const d = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), dayNum);
                                d.setHours(0,0,0,0);
                                const dKey = dateToKey(d);

                                const isPastDay = isDatePast(d);
                                const isBooked = isDateBooked(d);
                                
                                let cellClass = "aspect-square flex items-center justify-center rounded-xl text-xs font-semibold relative transition-all";
                                
                                const checkInKey = checkInDate ? dateToKey(checkInDate) : null;
                                const checkOutKey = checkOutDate ? dateToKey(checkOutDate) : null;

                                if (checkInKey === dKey || checkOutKey === dKey) {
                                  cellClass += " bg-[#3F434D] text-[#FBF7EC] scale-105 shadow-sm";
                                } else if (checkInDate && checkOutDate && d > checkInDate && d < checkOutDate) {
                                  cellClass += " bg-[#CFE4EC] text-[#3D7A95]";
                                } else if (isPastDay || isBooked) {
                                  cellClass += " text-[rgba(63,67,77,0.18)] cursor-not-allowed line-through";
                                } else {
                                  cellClass += " hover:bg-[#F5EFE0] text-[#3F434D]";
                                }

                                return (
                                  <button 
                                    key={dayNum} 
                                    onClick={(e) => { e.stopPropagation(); if(!isPastDay && !isBooked) selectDate(d); }}
                                    disabled={isPastDay || isBooked}
                                    className={cellClass}
                                  >
                                    {dayNum}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-2 justify-end border-t border-[rgba(63,67,77,0.08)] pt-4 mt-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setCheckInDate(null); setCheckOutDate(null); }}
                        className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#888B47]"
                      >
                        Clear Dates
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setCalendarOpen(false); }}
                        className="px-4 py-1.5 bg-[#3F434D] text-[#FBF7EC] rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-[#1E2024]"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="field-full border border-[rgba(63,67,77,0.08)] bg-[#F5EFE0] rounded-2xl p-3.5 mb-6">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1">Guests</label>
                <select 
                  value={guestCount} 
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="bg-transparent font-medium text-xs text-[#3F434D] w-full outline-none"
                >
                  <option value={1}>1 traveller</option>
                  <option value={2}>2 travellers</option>
                  <option value={3}>3 travellers</option>
                  <option value={4}>4 travellers · 1 infant</option>
                </select>
              </div>

              <button 
                onClick={triggerBookingSuccess}
                disabled={!checkInDate || !checkOutDate}
                className="w-full py-4 bg-[#A7AB5E] text-[#FBF7EC] hover:bg-[#888B47] disabled:bg-gray-200 disabled:text-[#6E727C] disabled:cursor-not-allowed rounded-full text-xs font-semibold uppercase tracking-widest shadow-md hover:shadow-lg transition-all"
              >
                {checkInDate && checkOutDate ? `Reserve · €${getSubtotal() + 45 + 38}` : 'Choose dates to continue'}
              </button>

              {/* Calculated Prices Block */}
              {checkInDate && checkOutDate && (
                <div className="border-t border-dashed border-[rgba(63,67,77,0.1)] pt-6 mt-6 text-xs text-[#6E727C] space-y-3">
                  <div className="flex justify-between">
                    <span>€{activeHouse.pricePerNight} × {getDaysCount()} nights</span>
                    <span className="font-semibold text-[#3F434D]">€{getSubtotal()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cleaning fee</span>
                    <span className="font-semibold text-[#3F434D]">€45</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mila service fee</span>
                    <span className="font-semibold text-[#3F434D]">€38</span>
                  </div>
                  <div className="border-t border-[rgba(63,67,77,0.08)] pt-3 flex justify-between text-sm font-bold text-[#3F434D]">
                    <span>Total stay price</span>
                    <span>€{getSubtotal() + 45 + 38}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
