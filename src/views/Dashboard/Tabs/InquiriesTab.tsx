import React from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { MessageInquiry } from '../../../types';

interface InquiriesTabProps {
  inquiries: MessageInquiry[];
  activeInquiryId: string | null;
  setActiveInquiryId: (id: string | null) => void;
  toggleInquiryRead: (id: string) => void;
  activeInquiry: MessageInquiry | undefined;
  replyText: string;
  setReplyText: (val: string) => void;
  handleSendReply: () => void;
}

export function InquiriesTab({
  inquiries, activeInquiryId, setActiveInquiryId, toggleInquiryRead,
  activeInquiry, replyText, setReplyText, handleSendReply
}: InquiriesTabProps) {
  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-display font-medium text-2xl text-[#3F434D]">Conversaciones con Huéspedes</h3>
          <p className="text-xs text-[#6E727C] mt-0.5">Responde directamente a los viajeros interesados en tus alojamientos.</p>
        </div>
      </div>

      {inquiries.length === 0 ? (
        <div className="bg-white border border-[rgba(63,67,77,0.08)] rounded-3xl p-12 text-center">
          <MessageSquare className="h-10 w-10 text-[#6E727C] mx-auto mb-3 opacity-60" />
          <p className="text-sm font-medium text-[#3F434D]">No hay consultas registradas todavía.</p>
          <p className="text-xs text-[#6E727C] mt-1">Los mensajes de viajeros aparecerán aquí.</p>
        </div>
      ) : (
        <div className="bg-white border border-[rgba(63,67,77,0.06)] rounded-3xl overflow-hidden flex flex-col md:flex-row h-[600px] shadow-sm">
          <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-[rgba(63,67,77,0.08)] bg-[#FBF7EC] overflow-y-auto">
            {inquiries.map(inq => (
              <div
                key={inq.id}
                onClick={() => {
                  setActiveInquiryId(inq.id);
                  if (!inq.read) toggleInquiryRead(inq.id);
                }}
                className={`p-4 border-b border-[rgba(63,67,77,0.04)] cursor-pointer transition-all ${
                  activeInquiry?.id === inq.id
                    ? 'bg-white border-l-4 border-l-[#3D7A95]'
                    : 'hover:bg-[rgba(255,255,255,0.5)] border-l-4 border-l-transparent'
                } ${!inq.read ? 'bg-[#F0DDBE]' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#3F434D] truncate pr-2 flex items-center gap-1">
                    {!inq.read && <div className="h-1.5 w-1.5 rounded-full bg-[#3D7A95]"></div>}
                    {inq.guestName}
                  </h4>
                  <span className="text-[10px] font-semibold text-[#6E727C] whitespace-nowrap">{inq.date}</span>
                </div>
                <p className="text-sm font-medium text-[#3D7A95] truncate mb-1">{inq.subject}</p>
                <p className="text-xs text-[#6E727C] truncate">{inq.message}</p>
              </div>
            ))}
          </div>

          {activeInquiry ? (
            <div className="w-full md:w-2/3 flex flex-col bg-white">
              <div className="p-5 border-b border-[rgba(63,67,77,0.06)] bg-white sticky top-0 z-10 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#3F434D]">{activeInquiry.subject}</h3>
                  <p className="text-xs text-[#6E727C] mt-1">
                    {activeInquiry.guestName} ({activeInquiry.guestEmail}) · {activeInquiry.houseName}
                  </p>
                </div>
                <button
                  onClick={() => toggleInquiryRead(activeInquiry.id)}
                  className={`py-1.5 px-3 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    activeInquiry.read
                      ? 'bg-[#FBF7EC] text-[#6E727C] border border-[rgba(63,67,77,0.1)]'
                      : 'bg-[#E6BE7A] text-white'
                  }`}
                >
                  {activeInquiry.read ? 'Marcar No Leído' : 'Marcar Leído'}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
                {activeInquiry.thread?.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col gap-1 ${msg.sender === 'host' ? 'items-end' : 'items-start'}`}
                  >
                    <span className={`text-[10px] uppercase font-bold text-[#6E727C] ${msg.sender === 'host' ? 'mr-2' : 'ml-2'}`}>
                      {msg.sender === 'host' ? 'Tú (Mila)' : activeInquiry.guestName} • {msg.date}
                    </span>
                    <div
                      className={`p-4 rounded-2xl max-w-[85%] text-sm font-light leading-relaxed ${
                        msg.sender === 'host'
                          ? 'bg-[#3D7A95] text-white rounded-tr-sm'
                          : 'bg-[#F5EFE0] text-[#3F434D] rounded-tl-sm'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-[rgba(63,67,77,0.08)] bg-[#FBF7EC]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                    placeholder="Responder al viajero..."
                    className="flex-1 bg-white border border-[rgba(63,67,77,0.1)] rounded-full px-4 py-3 text-sm focus:outline-none focus:border-[#3D7A95] transition-colors"
                  />
                  <button
                    onClick={handleSendReply}
                    className="h-11 w-11 bg-[#A7AB5E] text-white rounded-full flex items-center justify-center hover:bg-[#888B47] transition-colors shadow-sm shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full md:w-2/3 flex items-center justify-center text-sm text-[#6E727C] bg-white">
              Selecciona una conversación para responder.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
