import React from 'react';
import { House } from '../types';

interface ContactViewProps {
  houses: House[];
  contactName: string;
  setContactName: (name: string) => void;
  contactEmail: string;
  setContactEmail: (email: string) => void;
  contactHouseId: string;
  setContactHouseId: (id: string) => void;
  contactSubject: string;
  setContactSubject: (subject: string) => void;
  contactMessage: string;
  setContactMessage: (message: string) => void;
  handleSendInquiry: () => void;
}

export function ContactView({
  houses,
  contactName,
  setContactName,
  contactEmail,
  setContactEmail,
  contactHouseId,
  setContactHouseId,
  contactSubject,
  setContactSubject,
  contactMessage,
  setContactMessage,
  handleSendInquiry
}: ContactViewProps) {
  return (
    <div className="animate-fade-in py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        
        {/* Host bio & intro */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#3D7A95] bg-[#CFE4EC] px-4 py-1.5 rounded-full">Direct Communication</span>
          <h1 className="font-display font-light text-4xl sm:text-6xl text-[#3F434D] tracking-tight mt-6">Ask Mila</h1>
          <p className="text-sm font-light text-[#6E727C] leading-relaxed mt-4 mb-8">
            Have inquiries about property availability, long-term nomad relocation discounts, or the neighborhood guidelines in Las Palmas or Tafira? Drop a letter.
          </p>

          <div className="flex gap-4 p-5 bg-[#F5EFE0] rounded-3xl border border-[rgba(63,67,77,0.06)] mb-6">
            <div className="h-12 w-12 text-md rounded-full bg-[#A7AB5E] text-white flex items-center justify-center font-bold">M</div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#3F434D]">Host Mila</h4>
              <p className="text-xs font-light text-[#6E727C] mt-1 leading-relaxed">
                Born and raised in Gran Canaria. Surfer, lover of island history, and always happy to coordinate local excursions or set up workspace desks.
              </p>
            </div>
          </div>

          <div className="text-xs text-[#3F434D] font-semibold space-y-2 bg-white border border-[rgba(63,67,77,0.06)] p-5 rounded-3xl">
            <div>📞 +34 928 123 456</div>
            <div>✉️ hola@milanomad.es</div>
            <div className="text-[#6E727C] font-normal">Calle de León y Castillo 48, Las Palmas</div>
          </div>
        </div>

        {/* Inquiry form block */}
        <div className="bg-white border border-[rgba(63,67,77,0.1)] rounded-3xl p-8 shadow-xl">
          <h3 className="font-display font-medium text-2xl text-[#3F434D] mb-2">Send a message</h3>
          <p className="text-xs text-[#6E727C] mb-6">We will notify Mila and she will get back to you shortly.</p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">Your name</label>
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-3 px-4 rounded-xl text-xs outline-none focus:border-[#3D7A95] font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">Your email</label>
                <input 
                  type="email" 
                  placeholder="john@example.com" 
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-3 px-4 rounded-xl text-xs outline-none focus:border-[#3D7A95] font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">Regarding Stay</label>
              <select 
                value={contactHouseId}
                onChange={(e) => setContactHouseId(e.target.value)}
                className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-3.5 px-4 rounded-xl text-xs outline-none focus:border-[#3D7A95] font-medium"
              >
                {houses.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">Subject</label>
              <input 
                type="text" 
                placeholder="Question about workspace availability" 
                value={contactSubject}
                onChange={(e) => setContactSubject(e.target.value)}
                className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-3 px-4 rounded-xl text-xs outline-none focus:border-[#3D7A95] font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">Message</label>
              <textarea 
                placeholder="Tell Mila what you're looking for..." 
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-3 px-4 rounded-xl text-xs outline-none focus:border-[#3D7A95] font-medium min-h-[120px] resize-vertical"
              ></textarea>
            </div>

            <button 
              onClick={handleSendInquiry}
              className="w-full py-3.5 bg-[#A7AB5E] text-[#FBF7EC] hover:bg-[#888B47] rounded-full text-xs font-semibold uppercase tracking-widest shadow-sm hover:shadow"
            >
              Send inquiry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
