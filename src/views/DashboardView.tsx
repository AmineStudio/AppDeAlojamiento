import React from 'react';
import { Lock, Plus, X, Send } from 'lucide-react';
import { House, Room, MessageInquiry, HostProfile, BlogPost } from '../types';

interface DashboardViewProps {
  user: { name: string; email: string; role: 'guest' | 'host' } | null;
  triggerLoginModal: (tab: 'signin' | 'signup') => void;
  dashActiveTab: string;
  setDashActiveTab: (tab: string) => void;
  inquiries: MessageInquiry[];
  setInquiries: React.Dispatch<React.SetStateAction<MessageInquiry[]>>;
  toggleInquiryRead: (id: string) => void;
  houses: House[];
  blogPosts: BlogPost[];
  setBlogPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
  hostProfile: HostProfile;
  setHostProfile: React.Dispatch<React.SetStateAction<HostProfile>>;
  selectedHouseId: string;
  setSelectedHouseId: (id: string) => void;
  activeHouse: House;
  roomsByHouse: Record<string, Room[]>;
  setHouses: React.Dispatch<React.SetStateAction<House[]>>;
  setRoomsByHouse: React.Dispatch<React.SetStateAction<Record<string, Room[]>>>;
  editPricePrefix: Record<string, number>;
  setEditPricePrefix: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  toggleRoomAvailableOnDash: (roomId: string) => void;
  handleRemoveHousePhoto: (index: number) => void;
  handleAddHousePhoto: () => void;
  handleRemoveRoomPhoto: (roomId: string, index: number) => void;
  handleAddRoomPhoto: (roomId: string) => void;
  handleHostSavePricing: () => void;
  showToast: (msg: string) => void;
  newBlogTitle: string;
  setNewBlogTitle: (title: string) => void;
  newBlogCategory: string;
  setNewBlogCategory: (category: string) => void;
  newBlogExcerpt: string;
  setNewBlogExcerpt: (excerpt: string) => void;
  newBlogContent: string;
  setNewBlogContent: (content: string) => void;
  handlePublishStory: () => void;
  handleReplyInquiry: (id: string, message: string, role: 'host' | 'guest') => void;
  handleNavigate: (page: string, params?: { houseId?: string, blogId?: string }) => void;
  loadFailed: boolean;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (val: boolean) => void;
  isSaving: boolean;
  handleManualSave: () => void;
}

export function DashboardView({
  user,
  triggerLoginModal,
  dashActiveTab,
  setDashActiveTab,
  inquiries,
  setInquiries,
  toggleInquiryRead,
  houses,
  blogPosts,
  setBlogPosts,
  hostProfile,
  setHostProfile,
  selectedHouseId,
  setSelectedHouseId,
  activeHouse,
  roomsByHouse,
  setHouses,
  setRoomsByHouse,
  editPricePrefix,
  setEditPricePrefix,
  toggleRoomAvailableOnDash,
  handleRemoveHousePhoto,
  handleAddHousePhoto,
  handleRemoveRoomPhoto,
  handleAddRoomPhoto,
  handleHostSavePricing,
  showToast,
  newBlogTitle,
  setNewBlogTitle,
  newBlogCategory,
  setNewBlogCategory,
  newBlogExcerpt,
  setNewBlogExcerpt,
  newBlogContent,
  setNewBlogContent,
  handlePublishStory,
  handleReplyInquiry,
  handleNavigate,
  loadFailed,
  hasUnsavedChanges,
  setHasUnsavedChanges,
  isSaving,
  handleManualSave
}: DashboardViewProps) {
  const [activeInquiryId, setActiveInquiryId] = React.useState<string | null>(null);
  const [replyText, setReplyText] = React.useState('');
  const [editingBlogId, setEditingBlogId] = React.useState<string | null>(null);

  const activeInquiry = inquiries.find(inq => inq.id === activeInquiryId) || inquiries[0];

  const handleSendReply = () => {
    if (activeInquiry && replyText.trim()) {
      handleReplyInquiry(activeInquiry.id, replyText, 'host');
      setReplyText('');
    }
  };

  const handleEditStory = (blog: BlogPost) => {
    setEditingBlogId(blog.id);
    setNewBlogTitle(blog.title);
    setNewBlogCategory(blog.category);
    setNewBlogExcerpt(blog.excerpt);
    setNewBlogContent(blog.content);
  };

  const handleDeleteStory = (id: string) => {
    setBlogPosts(prev => prev.filter(b => b.id !== id));
    showToast('✔️ Story deleted successfully.');
    setHasUnsavedChanges(true);
    if (editingBlogId === id) {
      setEditingBlogId(null);
      setNewBlogTitle('');
      setNewBlogExcerpt('');
      setNewBlogContent('');
    }
  };

  const handleSaveStory = () => {
    if (!newBlogTitle.trim() || !newBlogContent.trim()) {
      showToast('Please fill in a title and the content story.');
      return;
    }

    if (editingBlogId) {
      setBlogPosts(prev => prev.map(b => b.id === editingBlogId ? {
        ...b,
        category: newBlogCategory,
        title: newBlogTitle,
        excerpt: newBlogExcerpt || newBlogContent.substring(0, 150) + '...',
        content: newBlogContent,
      } : b));
      showToast('✔️ Story updated successfully.');
      setHasUnsavedChanges(true);
      setEditingBlogId(null);
      setNewBlogTitle('');
      setNewBlogExcerpt('');
      setNewBlogContent('');
    } else {
      handlePublishStory();
      setHasUnsavedChanges(true);
    }
  };

  const handleChangeHouseField = (field: keyof House, value: any) => {
    setHouses(prev => prev.map(h => h.id === activeHouse.id ? { ...h, [field]: value } : h));
    setHasUnsavedChanges(true);
  };

  const handleChangeRoomField = (roomId: string, field: keyof Room, value: any) => {
    setRoomsByHouse(prev => ({
      ...prev,
      [activeHouse.id]: (prev[activeHouse.id] || []).map(r => r.id === roomId ? { ...r, [field]: value } : r)
    }));
    setHasUnsavedChanges(true);
  };

  const handleHostProfileChange = (field: keyof HostProfile, value: string) => {
    setHostProfile(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const SaveButton = () => (
    <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-2xl border border-[rgba(63,67,77,0.06)] shadow-sm">
      <div>
        {hasUnsavedChanges ? (
          <span className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            Cambios sin guardar
          </span>
        ) : (
          <span className="text-xs font-bold text-[#6E727C] uppercase tracking-widest">Todo está guardado</span>
        )}
      </div>
      <button
        onClick={handleManualSave}
        disabled={isSaving || !hasUnsavedChanges || loadFailed}
        className={`py-2 px-6 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
          hasUnsavedChanges && !isSaving && !loadFailed
            ? 'bg-[#A7AB5E] text-white hover:bg-[#888B47]' 
            : 'bg-[#F5EFE0] text-[#6E727C] cursor-not-allowed'
        }`}
      >
        {isSaving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </div>
  );

  return (
    <div className="animate-fade-in py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Locked alert graphic state */}
      {(!user || user.role !== 'host') ? (
        <div className="text-center max-w-md mx-auto py-16 bg-white border border-[rgba(63,67,77,0.1)] rounded-3xl p-8 shadow-xl">
          <Lock className="h-16 w-16 text-[#888B47] mx-auto mb-4" />
          <h2 className="font-display text-2xl font-medium text-[#3F434D] mb-2">Host Dashboard Locked</h2>
          <p className="text-xs text-[#6E727C] leading-relaxed mb-6">
            Only Host Mila can access listing schedules, rates management, and respond to incoming booking queries.
          </p>
          <button onClick={() => triggerLoginModal('signin')} className="py-2.5 px-6 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#3F434D] text-[#FBF7EC]">
            Sign in as Host
          </button>
        </div>
      ) : (
        // Active Dashboard Content for authorized Mila
        <div>
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-6 mb-12">
            <div>
              <h1 className="font-display font-light text-4xl sm:text-6xl text-[#3F434D] tracking-tight">Hola, <span className="italic font-normal text-[#A7AB5E]">Mila</span> ☀️</h1>
              <p className="text-xs font-light text-[#6E727C] mt-2">Manage room rates, toggle room availability, view inquiries, and write stories.</p>
            </div>
            <div className="text-xs font-bold uppercase tracking-widest bg-[#CFE4EC] text-[#3D7A95] px-4 py-2 rounded-full">
              M.I.L.A C🤍living active portfolio
            </div>
          </div>

          {/* Performance stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white border border-[rgba(63,67,77,0.06)] rounded-3xl p-5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#6E727C]">Revenue of June</span>
              <h3 className="font-display text-3xl font-extrabold text-[#3D7A95] tracking-tight mt-1">€5,890</h3>
              <p className="text-[9px] uppercase tracking-wider font-bold text-[#A7AB5E] mt-1">↑ 14% vs May</p>
            </div>
            <div className="bg-white border border-[rgba(63,67,77,0.06)] rounded-3xl p-5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#6E727C]">Active inquiries</span>
              <h3 className="font-display text-3xl font-extrabold text-[#3F434D] tracking-tight mt-1">{inquiries.filter(i=>!i.read).length}</h3>
              <p className="text-[9px] uppercase tracking-wider font-bold text-[#6E727C] mt-1">Awaiting attention</p>
            </div>
            <div className="bg-white border border-[rgba(63,67,77,0.06)] rounded-3xl p-5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#6E727C]">Occupancy Rate</span>
              <h3 className="font-display text-3xl font-extrabold text-[#A7AB5E] tracking-tight mt-1">86%</h3>
              <p className="text-[9px] uppercase tracking-wider font-bold text-[#A7AB5E] mt-1">↑ 4% vs May</p>
            </div>
            <div className="bg-white border border-[rgba(63,67,77,0.06)] rounded-3xl p-5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#6E727C]">Total reviews posted</span>
              <h3 className="font-display text-3xl font-extrabold text-[#3F434D] tracking-tight mt-1">112</h3>
              <p className="text-[9px] uppercase tracking-wider font-bold text-[#6E727C] mt-1">Avg 4.90 rating</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 flex-wrap mb-10 border-b border-[rgba(63,67,77,0.06)] pb-4">
            <button 
              onClick={() => setDashActiveTab('listings')}
              className={`py-2 px-5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${dashActiveTab === 'listings' ? 'bg-[#3F434D] text-[#FBF7EC]' : 'bg-[#F5EFE0] text-[#6E727C] hover:text-[#3F434D]'}`}
            >
              Manage Rooms & Pricing
            </button>
            <button 
              onClick={() => setDashActiveTab('inquiries')}
              className={`py-2 px-5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${dashActiveTab === 'inquiries' ? 'bg-[#3F434D] text-[#FBF7EC]' : 'bg-[#F5EFE0] text-[#6E727C] hover:text-[#3F434D]'}`}
            >
              Inquiries <span className="h-4.5 min-w-4.5 px-1 bg-[#A7AB5E] text-white rounded-full text-[9px] font-bold flex items-center justify-center">{inquiries.filter(i=>!i.read).length}</span>
            </button>
            <button 
              onClick={() => setDashActiveTab('stories')}
              className={`py-2 px-5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${dashActiveTab === 'stories' ? 'bg-[#3F434D] text-[#FBF7EC]' : 'bg-[#F5EFE0] text-[#6E727C] hover:text-[#3F434D]'}`}
            >
              Write a story
            </button>
            <button 
              onClick={() => setDashActiveTab('settings')}
              className={`py-2 px-5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${dashActiveTab === 'settings' ? 'bg-[#3F434D] text-[#FBF7EC]' : 'bg-[#F5EFE0] text-[#6E727C] hover:text-[#3F434D]'}`}
            >
              System settings
            </button>
          </div>

          {/* Tab content loops */}
          
          {/* Tab A: room management & pricing */}
          {dashActiveTab === 'listings' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-3">
                <SaveButton />
              </div>
              
              {/* Left house picker */}
              <div className="lg:col-span-1 border-r border-[rgba(63,67,77,0.06)] pr-0 lg:pr-8">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-4">Select Stay to edit</h4>
                <div className="space-y-3">
                  {houses.map(h => (
                    <div 
                      key={h.id}
                      onClick={() => setSelectedHouseId(h.id)}
                      className={`p-4 rounded-2xl cursor-pointer border transition-all flex items-center gap-3 ${h.id === selectedHouseId ? 'bg-white border-[#3D7A95] shadow-md' : 'bg-transparent border-[rgba(63,67,77,0.06)] hover:bg-[#F5EFE0]'}`}
                    >
                      <img src={h.images[0]} className="h-10 w-12 rounded-lg object-cover" alt="" />
                      <div className="flex-grow">
                        <h5 className="font-display font-medium text-xs text-[#3F434D]">{h.name}</h5>
                        <span className="text-[9px] uppercase tracking-wider font-bold text-[#6E727C] block mt-0.5">Base price: €{h.pricePerNight}/night</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Listing Editor panel */}
              <div className="lg:col-span-2">
                <fieldset disabled={loadFailed} className="border-none p-0 m-0 w-full min-w-0">
                <div className="bg-white border border-[rgba(63,67,77,0.1)] rounded-3xl p-6 shadow-xl">
                  <div className="flex justify-between items-center border-b border-[rgba(63,67,77,0.06)] pb-4 mb-6">
                    <div>
                      <h3 className="font-display font-medium text-xl text-[#3F434D]">{activeHouse.name}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#3D7A95]">{activeHouse.location}</span>
                    </div>
                    <button onClick={() => handleNavigate('detail', { houseId: activeHouse.id })} className="py-2 px-5 bg-white border border-[rgba(63,67,77,0.1)] hover:bg-[#F5EFE0] rounded-full text-[10px] font-bold uppercase tracking-wider text-[#3F434D]">
                      Preview stay
                    </button>
                  </div>

                  <div className="mb-8 space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">House Description</label>
                      <textarea 
                        value={activeHouse.description}
                        onChange={(e) => handleChangeHouseField('description', e.target.value)}
                        className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-3 px-4 rounded-xl text-xs outline-none min-h-[90px] resize-vertical"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">Home Amenities (comma separated)</label>
                      <input 
                        type="text" 
                        value={activeHouse.features.join(', ')}
                        onChange={(e) => handleChangeHouseField('features', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                        className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-2.5 px-4 rounded-xl text-xs outline-none"
                      />
                    </div>
                  </div>

                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-3">Room pricing & active availability</label>
                  <div className="space-y-4">
                    {(roomsByHouse[activeHouse.id] || []).map((r) => (
                      <div key={r.id} className="flex flex-col gap-4 p-4 rounded-2xl bg-[#FBF7EC] border border-[rgba(63,67,77,0.04)]">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <img src={r.images[0]} className="h-12 w-16 object-cover rounded-xl" alt="" />
                            <div>
                              <h6 className="font-display font-medium text-xs text-[#3F434D]">{r.name}</h6>
                              <p className="text-[9px] text-[#6E727C] uppercase tracking-wider mt-0.5">{r.beds} · {r.view}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 self-end sm:self-auto">
                            <div className="flex items-center gap-1 bg-white border border-[rgba(63,67,77,0.1)] rounded-xl px-3 py-1.5 w-24">
                              <span className="text-xs text-[#6E727C]">€</span>
                              <input 
                                type="number" 
                                value={editPricePrefix[r.id] !== undefined ? editPricePrefix[r.id] : r.price}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditPricePrefix(prev => ({
                                    ...prev,
                                    [r.id]: val === '' ? 0 : Number(val)
                                  }));
                                }}
                                className="w-full bg-transparent text-xs font-bold text-[#3F434D] outline-none"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => toggleRoomAvailableOnDash(r.id)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${r.available ? 'bg-[#A7AB5E]' : 'bg-[#6E727C]'}`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${r.available ? 'translate-x-6' : 'translate-x-1'}`} />
                              </button>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E727C]">
                                {r.available ? 'Free' : 'Booked'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">Room Description</label>
                          <textarea 
                            value={r.description}
                            onChange={(e) => handleChangeRoomField(r.id, 'description', e.target.value)}
                            className="w-full bg-white border border-[rgba(63,67,77,0.08)] py-2 px-3 rounded-xl text-xs outline-none min-h-[60px] resize-vertical"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-[rgba(63,67,77,0.06)]">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-3">House Photos</label>
                    <div className="flex gap-3 overflow-x-auto snap-x pb-2 w-full no-scrollbar mb-6">
                      {activeHouse.images.map((img, idx) => (
                        <div key={idx} className="relative group shrink-0">
                          <img src={img} className="h-24 w-32 object-cover rounded-xl snap-start" alt="" />
                          <button onClick={() => handleRemoveHousePhoto(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      <button onClick={handleAddHousePhoto} className="h-24 w-32 rounded-xl border border-dashed border-[rgba(63,67,77,0.4)] flex flex-col items-center justify-center text-[#6E727C] hover:bg-[#F5EFE0] transition-colors shrink-0">
                        <Plus className="h-5 w-5 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Add Photo</span>
                      </button>
                    </div>

                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-3">Room Photos</label>
                    <div className="space-y-4">
                      {(roomsByHouse[activeHouse.id] || []).map((r) => (
                        <div key={r.id}>
                          <h6 className="font-display font-medium text-xs text-[#3F434D] mb-2">{r.name}</h6>
                          <div className="flex gap-3 overflow-x-auto snap-x pb-2 w-full no-scrollbar mb-2">
                            {r.images.map((img, idx) => (
                              <div key={idx} className="relative group shrink-0">
                                <img src={img} className="h-20 w-28 object-cover rounded-xl snap-start" alt="" />
                                <button onClick={() => handleRemoveRoomPhoto(r.id, idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                            <button onClick={() => handleAddRoomPhoto(r.id)} className="h-20 w-28 rounded-xl border border-dashed border-[rgba(63,67,77,0.4)] flex flex-col items-center justify-center text-[#6E727C] hover:bg-[#F5EFE0] transition-colors shrink-0">
                              <Plus className="h-5 w-5 mb-1" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">Add Photo</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-[rgba(63,67,77,0.06)] flex gap-3">
                    <button onClick={handleHostSavePricing} className="py-2.5 px-6 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#3F434D] text-[#FBF7EC] hover:bg-[#1E2024]">
                      Save Rates Setup
                    </button>
                  </div>
                </div>
                </fieldset>
              </div>
            </div>
          )}

          {/* Tab B: Inquiries / Message stream */}
          {dashActiveTab === 'inquiries' && (
            <div className="space-y-4 max-w-6xl mx-auto">
              <h3 className="font-display font-medium text-2xl text-[#3F434D] mb-6">Guest Conversations</h3>
              
              {inquiries.length === 0 ? (
                <p className="text-xs text-[#6E727C]">No inquiries received yet.</p>
              ) : (
                <div className="bg-white border border-[rgba(63,67,77,0.06)] rounded-3xl overflow-hidden flex flex-col md:flex-row h-[600px] shadow-sm">
                  {/* Thread List Sidebar */}
                  <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-[rgba(63,67,77,0.08)] bg-[#FBF7EC] overflow-y-auto">
                    {inquiries.map(inq => (
                      <div 
                        key={inq.id}
                        onClick={() => {
                          setActiveInquiryId(inq.id);
                          if (!inq.read) toggleInquiryRead(inq.id); // Mark read when selected
                        }}
                        className={`p-4 border-b border-[rgba(63,67,77,0.04)] cursor-pointer transition-all ${activeInquiry?.id === inq.id ? 'bg-white border-l-4 border-l-[#3D7A95]' : 'hover:bg-[rgba(255,255,255,0.5)] border-l-4 border-l-transparent'} ${!inq.read ? 'bg-[#F0DDBE]' : ''}`}
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

                  {/* Thread Chat Area */}
                  {activeInquiry ? (
                    <div className="w-full md:w-2/3 flex flex-col bg-white">
                      <div className="p-5 border-b border-[rgba(63,67,77,0.06)] bg-white sticky top-0 z-10 flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-bold uppercase tracking-wider text-[#3F434D]">{activeInquiry.subject}</h3>
                          <p className="text-xs text-[#6E727C] mt-1">{activeInquiry.guestName} ({activeInquiry.guestEmail}) · {activeInquiry.houseName}</p>
                        </div>
                        <button 
                          onClick={() => toggleInquiryRead(activeInquiry.id)}
                          className={`py-1.5 px-3 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${activeInquiry.read ? 'bg-[#FBF7EC] text-[#6E727C] border border-[rgba(63,67,77,0.1)]' : 'bg-[#E6BE7A] text-white'}`}
                        >
                          {activeInquiry.read ? 'Mark Unread' : 'Mark Read'}
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
                        {/* Thread messages */}
                        {activeInquiry.thread?.map(msg => (
                          <div key={msg.id} className={`flex flex-col gap-1 ${msg.sender === 'host' ? 'items-end' : 'items-start'}`}>
                            <span className={`text-[10px] uppercase font-bold text-[#6E727C] ${msg.sender === 'host' ? 'mr-2' : 'ml-2'}`}>
                              {msg.sender === 'host' ? 'You (Mila)' : activeInquiry.guestName} • {msg.date}
                            </span>
                            <div className={`p-4 rounded-2xl max-w-[85%] text-sm font-light leading-relaxed ${msg.sender === 'host' ? 'bg-[#3D7A95] text-white rounded-tr-sm' : 'bg-[#F5EFE0] text-[#3F434D] rounded-tl-sm'}`}>
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
                            placeholder="Reply to guest..."
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
                      Select an inquiry to view
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab C: story publication */}
          {dashActiveTab === 'stories' && (
            <fieldset disabled={loadFailed} className="border-none p-0 m-0 w-full min-w-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="lg:col-span-2">
                <SaveButton />
              </div>
              <div className="bg-white border border-[rgba(63,67,77,0.1)] rounded-3xl p-6 shadow-xl h-fit">
                <h3 className="font-display font-medium text-2xl text-[#3F434D] mb-4">Existing Stories</h3>
                {blogPosts.length === 0 ? (
                  <p className="text-xs text-[#6E727C]">No stories published yet.</p>
                ) : (
                  <div className="space-y-4">
                    {blogPosts.map(blog => (
                      <div key={blog.id} className="p-4 border border-[rgba(63,67,77,0.08)] rounded-2xl flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-[#A7AB5E]">{blog.category}</span>
                            <h4 className="font-bold text-sm text-[#3F434D]">{blog.title}</h4>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleEditStory(blog)} className="text-xs text-[#6E727C] hover:text-[#3D7A95] font-semibold">Edit</button>
                            <button onClick={() => handleDeleteStory(blog.id)} className="text-xs text-[#6E727C] hover:text-red-500 font-semibold">Delete</button>
                          </div>
                        </div>
                        <p className="text-xs text-[#6E727C] line-clamp-2">{blog.excerpt}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white border border-[rgba(63,67,77,0.1)] rounded-3xl p-6 shadow-xl h-fit">
                <h3 className="font-display font-medium text-2xl text-[#3F434D] mb-2">{editingBlogId ? 'Edit Story' : 'Publish a local story'}</h3>
                <p className="text-xs text-[#6E727C] mb-6">Write custom travel articles, local restaurant guides or mountain hiking paths.</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">Article Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Best Seafood spots in Las Palmas" 
                      value={newBlogTitle}
                      onChange={(e) => setNewBlogTitle(e.target.value)}
                      className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-3 px-4 rounded-xl text-xs outline-none focus:border-[#3D7A95] font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">Category</label>
                      <select 
                        value={newBlogCategory}
                        onChange={(e) => setNewBlogCategory(e.target.value)}
                        className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-3.5 px-4 rounded-xl text-xs outline-none focus:border-[#3D7A95] font-medium"
                      >
                        <option value="Local secrets 🤫">Local secrets 🤫</option>
                        <option value="Food & Wine 🍷">Food & Wine 🍷</option>
                        <option value="House stories 🏡">House stories 🏡</option>
                        <option value="Adventure Trails 🧗">Adventure Trails 🧗</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">Short Excerpt Summary</label>
                      <input 
                        type="text" 
                        placeholder="An exploration of local gastronomy." 
                        value={newBlogExcerpt}
                        onChange={(e) => setNewBlogExcerpt(e.target.value)}
                        className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-3 px-4 rounded-xl text-xs outline-none focus:border-[#3D7A95] font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">Article Body Story</label>
                    <textarea 
                      placeholder="Begin writing your story..." 
                      value={newBlogContent}
                      onChange={(e) => setNewBlogContent(e.target.value)}
                      className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-3 px-4 rounded-xl text-xs outline-none focus:border-[#3D7A95] font-medium min-h-[180px] resize-vertical"
                    ></textarea>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={handleSaveStory} className="flex-1 py-2.5 px-6 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#A7AB5E] text-[#FBF7EC] hover:bg-[#888B47]">
                      {editingBlogId ? 'Save Changes' : 'Publish Article'}
                    </button>
                    {editingBlogId && (
                      <button 
                        onClick={() => {
                          setEditingBlogId(null);
                          setNewBlogTitle('');
                          setNewBlogExcerpt('');
                          setNewBlogContent('');
                        }} 
                        className="py-2.5 px-6 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#F5EFE0] text-[#6E727C] hover:text-[#3F434D]"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            </fieldset>
          )}

          {/* Tab D: host system settings */}
          {dashActiveTab === 'settings' && (
            <fieldset disabled={loadFailed} className="border-none p-0 m-0 w-full min-w-0">
            <div className="max-w-2xl mx-auto space-y-6">
              <SaveButton />
              <div className="bg-white border border-[rgba(63,67,77,0.1)] rounded-3xl p-6 shadow-xl space-y-6">
              <div>
                <h3 className="font-display font-medium text-xl text-[#3F434D] mb-1">Host Review prompts</h3>
                <p className="text-xs text-[#6E727C]">Configure trigger conditions asking guests to leave reviews post checkout.</p>
                
                <div className="border-t border-[rgba(63,67,77,0.08)] mt-4 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Active email automation triggers</span>
                    <button className="h-6 w-11 inline-flex items-center rounded-full bg-[#A7AB5E] focus:outline-none">
                      <span className="h-4 w-4 transform rounded-full bg-white translate-x-6" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Show active banner to checked out travellers</span>
                    <button className="h-6 w-11 inline-flex items-center rounded-full bg-[#A7AB5E] focus:outline-none">
                      <span className="h-4 w-4 transform rounded-full bg-white translate-x-6" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-[rgba(63,67,77,0.08)] pt-6">
                <h3 className="font-display font-medium text-xl text-[#3F434D] mb-4">Edit Host bio & contact</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">Host Name</label>
                    <input 
                      type="text" 
                      value={hostProfile.name} 
                      onChange={(e) => setHostProfile(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-2.5 px-4 rounded-xl text-xs outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">Host Title</label>
                    <input 
                      type="text" 
                      value={hostProfile.title} 
                      onChange={(e) => setHostProfile(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-2.5 px-4 rounded-xl text-xs outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">Host bio</label>
                    <textarea 
                      value={hostProfile.bio} 
                      onChange={(e) => setHostProfile(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-3 px-4 rounded-xl text-xs outline-none min-h-[90px] resize-vertical"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">Phone Number</label>
                      <input 
                        type="text" 
                        value={hostProfile.phone} 
                        onChange={(e) => setHostProfile(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-2.5 px-4 rounded-xl text-xs outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">Email Address</label>
                      <input 
                        type="email" 
                        value={hostProfile.email} 
                        onChange={(e) => setHostProfile(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-2.5 px-4 rounded-xl text-xs outline-none" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">Address</label>
                    <input 
                      type="text" 
                      value={hostProfile.address} 
                      onChange={(e) => setHostProfile(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-2.5 px-4 rounded-xl text-xs outline-none" 
                    />
                  </div>
                  <button onClick={() => showToast('✔️ Profile bio & contact updated successfully.')} className="py-2.5 px-6 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#3F434D] text-[#FBF7EC]">
                    Update profile
                  </button>
                </div>
              </div>
            </div>
            </div>
            </fieldset>
          )}
        </div>
      )}
    </div>
  );
}
