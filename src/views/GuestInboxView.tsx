import React, { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { MessageInquiry } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';
import textos from '../content/textos.json';

interface GuestInboxViewProps {
  user?: { name: string; email: string; role: 'guest' | 'host' } | null;
  inquiries?: MessageInquiry[];
  handleReplyInquiry?: (id: string, message: string, role: 'host' | 'guest') => void;
}

export function GuestInboxView(props: GuestInboxViewProps) {
  const { user: ctxUser } = useAuth();
  const { inquiries: ctxInquiries, replyInquiry } = useData();
  const { showToast } = useToast();
  const tInbox = textos.inbox;

  const user = props.user !== undefined ? props.user : ctxUser;
  const inquiries = props.inquiries || ctxInquiries;

  const [activeInquiryId, setActiveInquiryId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  if (!user) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm text-[#6E727C]">{tInbox.loginPrompt}</p>
      </div>
    );
  }

  // Filtrar consultas del huésped actual
  const myInquiries = inquiries.filter(inq => inq.guestEmail.toLowerCase() === (user.email || '').toLowerCase());
  const activeInquiry = myInquiries.find(inq => inq.id === activeInquiryId) || myInquiries[0];

  const handleSendReply = async () => {
    if (activeInquiry && replyText.trim()) {
      if (props.handleReplyInquiry) {
        props.handleReplyInquiry(activeInquiry.id, replyText, 'guest');
      } else {
        const res = await replyInquiry(activeInquiry.id, replyText, 'guest');
        if (res.success) {
          showToast(tInbox.replySuccess);
        } else {
          showToast(tInbox.replyError + (res.error || 'Error'));
        }
      }
      setReplyText('');
    }
  };

  return (
    <div className="animate-fade-in py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display font-light text-3xl sm:text-4xl text-[#3F434D] tracking-tight">{tInbox.title}</h1>
          <p className="text-sm font-medium text-[#6E727C] mt-2">{tInbox.subtitle}</p>
        </div>

        {myInquiries.length === 0 ? (
          <div className="bg-white border border-[rgba(63,67,77,0.06)] rounded-3xl p-12 text-center">
            <MessageSquare className="h-12 w-12 text-[#CFE4EC] mx-auto mb-4" />
            <h3 className="font-display text-2xl text-[#3F434D] mb-2">{tInbox.emptyTitle}</h3>
            <p className="text-sm text-[#6E727C]">{tInbox.emptySubtitle}</p>
          </div>
        ) : (
          <div className="bg-white border border-[rgba(63,67,77,0.06)] rounded-3xl overflow-hidden flex flex-col md:flex-row h-[600px] shadow-sm">
            {/* Lista lateral de conversaciones */}
            <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-[rgba(63,67,77,0.08)] bg-[#FBF7EC] overflow-y-auto">
              {myInquiries.map(inq => (
                <div 
                  key={inq.id}
                  onClick={() => setActiveInquiryId(inq.id)}
                  className={`p-4 border-b border-[rgba(63,67,77,0.04)] cursor-pointer transition-all ${activeInquiry?.id === inq.id ? 'bg-white border-l-4 border-l-[#3D7A95]' : 'hover:bg-[rgba(255,255,255,0.5)] border-l-4 border-l-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#3F434D] truncate pr-2">{inq.houseName}</h4>
                    <span className="text-[10px] font-semibold text-[#6E727C] whitespace-nowrap">{inq.date}</span>
                  </div>
                  <p className="text-sm font-medium text-[#3D7A95] truncate mb-1">{inq.subject}</p>
                  <p className="text-xs text-[#6E727C] truncate">{inq.message}</p>
                </div>
              ))}
            </div>

            {/* Área de chat */}
            <div className="w-full md:w-2/3 flex flex-col justify-between bg-white">
              {activeInquiry ? (
                <>
                  <div className="p-4 border-b border-[rgba(63,67,77,0.08)] bg-white flex justify-between items-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#3D7A95]">{activeInquiry.houseName}</span>
                      <h4 className="font-semibold text-sm text-[#3F434D]">{activeInquiry.subject}</h4>
                    </div>
                  </div>

                  <div className="p-6 overflow-y-auto flex-grow space-y-4 bg-gray-50/40">
                    {/* Mensaje original */}
                    <div className="flex flex-col items-end">
                      <div className="bg-[#3F434D] text-[#FBF7EC] rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%] text-xs shadow-sm">
                        <p className="font-semibold text-[10px] text-[#A7AB5E] mb-1">{tInbox.initialInquiryBadge}</p>
                        <p className="leading-relaxed">{activeInquiry.message}</p>
                        <span className="text-[9px] text-[#FBF7EC]/60 block text-right mt-1">{activeInquiry.date}</span>
                      </div>
                    </div>

                    {/* Hilo de conversación */}
                    {activeInquiry.thread && activeInquiry.thread.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col ${msg.sender === 'guest' ? 'items-end' : 'items-start'}`}
                      >
                        <div 
                          className={`rounded-2xl px-4 py-3 max-w-[80%] text-xs shadow-sm ${
                            msg.sender === 'guest' 
                              ? 'bg-[#3F434D] text-[#FBF7EC] rounded-tr-none' 
                              : 'bg-white border border-[rgba(63,67,77,0.1)] text-[#3F434D] rounded-tl-none'
                          }`}
                        >
                          <p className={`font-semibold text-[10px] mb-1 ${msg.sender === 'guest' ? 'text-[#A7AB5E]' : 'text-[#3D7A95]'}`}>
                            {msg.sender === 'guest' ? tInbox.you : tInbox.hostSender}
                          </p>
                          <p className="leading-relaxed">{msg.message}</p>
                          <span className={`text-[9px] block text-right mt-1 ${msg.sender === 'guest' ? 'text-[#FBF7EC]/60' : 'text-[#6E727C]'}`}>
                            {msg.date}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input de respuesta */}
                  <div className="p-4 border-t border-[rgba(63,67,77,0.08)] bg-white flex gap-2">
                    <input 
                      type="text" 
                      placeholder={tInbox.replyPlaceholder}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                      className="flex-grow bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] px-4 py-2.5 rounded-full text-xs outline-none focus:border-[#3D7A95]"
                    />
                    <button 
                      onClick={handleSendReply}
                      className="p-2.5 bg-[#A7AB5E] text-white rounded-full hover:bg-[#888B47] transition-all shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-[#6E727C]">
                  {tInbox.selectConversation}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
