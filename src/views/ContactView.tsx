import React, { useState, useEffect } from 'react';
import { House, HostProfile } from '../types';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import textos from '../content/textos.json';

interface ContactViewProps {
  houses?: House[];
  hostProfile?: HostProfile;
  contactName?: string;
  setContactName?: (name: string) => void;
  contactEmail?: string;
  setContactEmail?: (email: string) => void;
  contactHouseId?: string;
  setContactHouseId?: (id: string) => void;
  contactSubject?: string;
  setContactSubject?: (subject: string) => void;
  contactMessage?: string;
  setContactMessage?: (message: string) => void;
  handleSendInquiry?: () => void;
}

export function ContactView(props: ContactViewProps) {
  const { houses: ctxHouses, hostProfile: ctxHostProfile, sendInquiry } = useData();
  const { user, triggerLoginModal } = useAuth();
  const { showToast } = useToast();
  const tCont = textos.contact;

  const houses = props.houses || ctxHouses;
  const hostProfile = props.hostProfile || ctxHostProfile;

  const [localName, setLocalName] = useState(user ? user.name : '');
  const [localEmail, setLocalEmail] = useState(user ? user.email : '');
  const [localHouseId, setLocalHouseId] = useState(houses[0]?.id || '');
  const [localSubject, setLocalSubject] = useState('');
  const [localMessage, setLocalMessage] = useState('');

  useEffect(() => {
    if (!localHouseId && houses.length > 0) {
      setLocalHouseId(houses[0].id);
    }
  }, [houses, localHouseId]);

  const name = props.contactName !== undefined ? props.contactName : localName;
  const setName = props.setContactName || setLocalName;
  const email = props.contactEmail !== undefined ? props.contactEmail : localEmail;
  const setEmail = props.setContactEmail || setLocalEmail;
  const houseId = props.contactHouseId !== undefined ? props.contactHouseId : localHouseId;
  const setHouseId = props.setContactHouseId || setLocalHouseId;
  const subject = props.contactSubject !== undefined ? props.contactSubject : localSubject;
  const setSubject = props.setContactSubject || setLocalSubject;
  const message = props.contactMessage !== undefined ? props.contactMessage : localMessage;
  const setMessage = props.setContactMessage || setLocalMessage;

  const handleSubmit = props.handleSendInquiry || (async () => {
    const finalEmail = email.trim() || (user ? user.email : '');
    const finalName = name.trim() || (user ? user.name : '');

    if (!finalEmail || !finalName || !message.trim()) {
      showToast(tCont.validationError);
      return;
    }

    if (!user) {
      showToast(tCont.loginError);
      triggerLoginModal('signin');
      return;
    }

    const selectedTargetHouse = houses.find(h => h.id === houseId) || houses[0];
    const res = await sendInquiry(
      finalName,
      finalEmail,
      selectedTargetHouse?.name || 'Stay',
      subject.trim(),
      message.trim()
    );

    if (res.success) {
      setSubject('');
      setMessage('');
      showToast(tCont.successToast.replace('{name}', hostProfile.name));
    } else {
      showToast(tCont.errorToast + (res.error || 'Error'));
    }
  });

  return (
    <div className="animate-fade-in py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        
        {/* Host bio & intro */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#3D7A95] bg-[#CFE4EC] px-4 py-1.5 rounded-full">
            {tCont.badge}
          </span>
          <h1 className="font-display font-light text-4xl sm:text-6xl text-[#3F434D] tracking-tight mt-6">
            {tCont.heading.replace('{name}', hostProfile.name)}
          </h1>
          <p className="text-sm font-light text-[#6E727C] leading-relaxed mt-4 mb-8">
            {tCont.subtitle}
          </p>

          <div className="flex gap-4 p-5 bg-[#F5EFE0] rounded-3xl border border-[rgba(63,67,77,0.06)] mb-6">
            <div className="h-12 w-12 text-md rounded-full bg-[#A7AB5E] text-white flex items-center justify-center font-bold shrink-0">
              {hostProfile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#3F434D]">{hostProfile.title}</h4>
              <p className="text-xs font-light text-[#6E727C] mt-1 leading-relaxed">
                {hostProfile.bio}
              </p>
            </div>
          </div>

          <div className="text-xs text-[#3F434D] font-semibold space-y-2 bg-white border border-[rgba(63,67,77,0.06)] p-5 rounded-3xl">
            <div>📞 {hostProfile.phone}</div>
            <div>✉️ {hostProfile.email}</div>
            <div className="text-[#6E727C] font-normal">{hostProfile.address}</div>
          </div>
        </div>

        {/* Inquiry form block */}
        <div className="bg-white border border-[rgba(63,67,77,0.1)] rounded-3xl p-8 shadow-xl">
          <h3 className="font-display font-medium text-2xl text-[#3F434D] mb-2">{tCont.cardTitle}</h3>
          <p className="text-xs text-[#6E727C] mb-6">{tCont.cardSubtitle.replace('{name}', hostProfile.name)}</p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">{tCont.nameLabel}</label>
                <input 
                  type="text" 
                  placeholder={tCont.namePlaceholder} 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-3 px-4 rounded-xl text-xs outline-none focus:border-[#3D7A95] font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">{tCont.emailLabel}</label>
                <input 
                  type="email" 
                  placeholder={tCont.emailPlaceholder} 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-3 px-4 rounded-xl text-xs outline-none focus:border-[#3D7A95] font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">{tCont.stayLabel}</label>
              <select 
                value={houseId}
                onChange={(e) => setHouseId(e.target.value)}
                className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-3.5 px-4 rounded-xl text-xs outline-none focus:border-[#3D7A95] font-medium"
              >
                {houses.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">{tCont.subjectLabel}</label>
              <input 
                type="text" 
                placeholder={tCont.subjectPlaceholder} 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-3 px-4 rounded-xl text-xs outline-none focus:border-[#3D7A95] font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">{tCont.messageLabel}</label>
              <textarea 
                placeholder={tCont.messagePlaceholder} 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-3 px-4 rounded-xl text-xs outline-none focus:border-[#3D7A95] font-medium min-h-[120px] resize-vertical"
              ></textarea>
            </div>

            <button 
              onClick={handleSubmit}
              className="w-full py-3.5 bg-[#A7AB5E] text-[#FBF7EC] hover:bg-[#888B47] rounded-full text-xs font-semibold uppercase tracking-widest shadow-sm hover:shadow transition-all"
            >
              {tCont.sendButton}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
