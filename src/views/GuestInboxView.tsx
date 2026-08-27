import React, { useState } from 'react';
import { Send, User, MessageSquare } from 'lucide-react';
import { MessageInquiry } from '../types';

interface GuestInboxViewProps {
  user: { name: string; email: string; role: 'guest' | 'host' };
  inquiries: MessageInquiry[];
  handleReplyInquiry: (id: string, message: string, role: 'host' | 'guest') => void;
}

export function GuestInboxView({ user, inquiries, handleReplyInquiry }: GuestInboxViewProps) {
  const [activeInquiryId, setActiveInquiryId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Filter inquiries belonging to the current guest
  const myInquiries = inquiries.filter(inq => inq.guestEmail.toLowerCase() === user.email.toLowerCase());
  
  const activeInquiry = myInquiries.find(inq => inq.id === activeInquiryId) || myInquiries[0];

  const handleSendReply = () => {
    if (activeInquiry && replyText.trim()) {
      handleReplyInquiry(activeInquiry.id, replyText, 'guest');
      setReplyText('');
    }
  };

  return (
    <div className="animate-fade-in py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display font-light text-3xl sm:text-4xl text-[#3F434D] tracking-tight">My Messages</h1>
          <p className="text-sm font-medium text-[#6E727C] mt-2">Manage your conversations with Mila</p>
        </div>

        {myInquiries.length === 0 ? (
          <div className="bg-white border border-[rgba(63,67,77,0.06)] rounded-3xl p-12 text-center">
            <MessageSquare className="h-12 w-12 text-[#CFE4EC] mx-auto mb-4" />
            <h3 className="font-display text-2xl text-[#3F434D] mb-2">No messages yet</h3>
            <p className="text-sm text-[#6E727C]">When you send inquiries or contact Mila, they will appear here.</p>
          </div>
        ) : (
          <div className="bg-white border border-[rgba(63,67,77,0.06)] rounded-3xl overflow-hidden flex flex-col md:flex-row h-[600px] shadow-sm">
            {/* Thread List Sidebar */}
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

            {/* Thread Chat Area */}
            {activeInquiry ? (
              <div className="w-full md:w-2/3 flex flex-col bg-white">
                <div className="p-5 border-b border-[rgba(63,67,77,0.06)] bg-white sticky top-0 z-10">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#3F434D]">{activeInquiry.subject}</h3>
                  <p className="text-xs text-[#6E727C] mt-1">{activeInquiry.houseName}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
                  {/* Thread messages */}
                  {activeInquiry.thread?.map(msg => (
                    <div key={msg.id} className={`flex flex-col gap-1 ${msg.sender === 'guest' ? 'items-end' : 'items-start'}`}>
                      <span className={`text-[10px] uppercase font-bold text-[#6E727C] ${msg.sender === 'guest' ? 'mr-2' : 'ml-2'}`}>
                        {msg.sender === 'guest' ? 'You' : 'Mila'} • {msg.date}
                      </span>
                      <div className={`p-4 rounded-2xl max-w-[85%] text-sm font-light leading-relaxed ${msg.sender === 'guest' ? 'bg-[#3D7A95] text-white rounded-tr-sm' : 'bg-[#F5EFE0] text-[#3F434D] rounded-tl-sm'}`}>
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
                      placeholder="Write a message to Mila..."
                      className="flex-1 bg-white border border-[rgba(63,67,77,0.1)] rounded-full px-4 py-3 text-sm focus:outline-none focus:border-[#3D7A95] transition-colors"
                    />
                    <button 
                      onClick={handleSendReply}
                      className="h-11 w-11 bg-[#A7AB5E] text-white rounded-full flex items-center justify-center hover:bg-[#888B47] transition-colors shadow-sm"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full md:w-2/3 flex items-center justify-center text-sm text-[#6E727C] bg-white">
                Select a conversation to view
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
