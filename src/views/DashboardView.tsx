import React, { useState, useMemo } from 'react';
import { 
  Lock, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  ExternalLink, 
  Home, 
  Bed, 
  BookOpen, 
  MessageSquare, 
  Settings, 
  Check, 
  Search, 
  Filter, 
  MapPin, 
  Send,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { House, Room, MessageInquiry, HostProfile, BlogPost } from '../types';
import { HouseModal } from '../components/HouseModal';
import { RoomModal } from '../components/RoomModal';
import { StoryModal } from '../components/StoryModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import textos from '../content/textos.json';

interface DashboardViewProps {
  user: { name: string; email: string; role: 'guest' | 'host' } | null;
  triggerLoginModal: (tab?: 'signin' | 'signup') => void;
  dashActiveTab: string;
  setDashActiveTab: (tab: string) => void;
  inquiries: MessageInquiry[];
  setInquiries?: React.Dispatch<React.SetStateAction<MessageInquiry[]>>;
  toggleInquiryRead: (id: string) => void;
  houses: House[];
  blogPosts: BlogPost[];
  setBlogPosts?: React.Dispatch<React.SetStateAction<BlogPost[]>>;
  hostProfile: HostProfile;
  setHostProfile: React.Dispatch<React.SetStateAction<HostProfile>>;
  selectedHouseId: string;
  setSelectedHouseId: (id: string) => void;
  activeHouse: House;
  roomsByHouse: Record<string, Room[]>;
  setHouses?: React.Dispatch<React.SetStateAction<House[]>>;
  setRoomsByHouse?: React.Dispatch<React.SetStateAction<Record<string, Room[]>>>;
  editPricePrefix?: Record<string, number>;
  setEditPricePrefix?: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  toggleRoomAvailableOnDash?: (roomId: string) => void;
  handleRemoveHousePhoto?: (index: number) => void;
  handleAddHousePhoto?: () => void;
  handleRemoveRoomPhoto?: (roomId: string, index: number) => void;
  handleAddRoomPhoto?: (roomId: string) => void;
  handleHostSavePricing?: () => void;
  showToast: (msg: string) => void;
  newBlogTitle?: string;
  setNewBlogTitle?: (title: string) => void;
  newBlogCategory?: string;
  setNewBlogCategory?: (category: string) => void;
  newBlogExcerpt?: string;
  setNewBlogExcerpt?: (excerpt: string) => void;
  newBlogContent?: string;
  setNewBlogContent?: (content: string) => void;
  handlePublishStory?: () => void;
  handleReplyInquiry: (id: string, message: string, role: 'host' | 'guest') => void;
  handleNavigate: (page: string, params?: { houseId?: string; blogId?: string }) => void;
  loadFailed: boolean;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (val: boolean) => void;
  isSaving: boolean;
  handleManualSave: () => void;

  onSaveHouse?: (house: House, isEdit: boolean) => void;
  onDeleteHouse?: (houseId: string) => void;
  onSaveRoom?: (targetHouseId: string, room: Room, isEdit: boolean, originalHouseId?: string) => void;
  onDeleteRoom?: (houseId: string, roomId: string) => void;
  onSaveStory?: (story: BlogPost, isEdit: boolean) => void;
  onDeleteStory?: (storyId: string) => void;
}

export function DashboardView({
  user,
  triggerLoginModal,
  dashActiveTab,
  setDashActiveTab,
  inquiries,
  toggleInquiryRead,
  houses,
  blogPosts,
  hostProfile,
  setHostProfile,
  selectedHouseId,
  setSelectedHouseId,
  activeHouse,
  roomsByHouse,
  showToast,
  handleReplyInquiry,
  handleNavigate,
  loadFailed,
  hasUnsavedChanges,
  setHasUnsavedChanges,
  isSaving,
  handleManualSave,
  onSaveHouse,
  onDeleteHouse,
  onSaveRoom,
  onDeleteRoom,
  onSaveStory,
  onDeleteStory
}: DashboardViewProps) {
  const tPan = textos.panel;
  const tCas = textos.casas;
  const tHab = textos.habitaciones;
  const tHis = textos.historias;
  const tGen = textos.general;

  // Modal states
  const [houseModalOpen, setHouseModalOpen] = useState(false);
  const [editingHouse, setEditingHouse] = useState<House | null>(null);

  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomTargetHouseId, setRoomTargetHouseId] = useState<string>('');

  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<BlogPost | null>(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'house' | 'room' | 'story';
    id: string;
    houseId?: string;
    title: string;
    warningNote?: string;
  } | null>(null);

  // Search & Filter in tabs
  const [houseSearch, setHouseSearch] = useState('');
  const [roomHouseFilter, setRoomHouseFilter] = useState<string>('all');
  const [roomSearch, setRoomSearch] = useState('');
  const [storySearch, setStorySearch] = useState('');

  // Inquiry reply state
  const [activeInquiryId, setActiveInquiryId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const activeInquiry = inquiries.find(inq => inq.id === activeInquiryId) || inquiries[0];

  // Total rooms computation across all houses
  const allRoomsList = useMemo(() => {
    const list: { room: Room; house: House }[] = [];
    houses.forEach(h => {
      const rooms = roomsByHouse[h.id] || [];
      rooms.forEach(r => {
        list.push({ room: r, house: h });
      });
    });
    return list;
  }, [houses, roomsByHouse]);

  const totalAvailableRooms = allRoomsList.filter(item => item.room.available).length;
  const totalOccupiedRooms = allRoomsList.filter(item => !item.room.available).length;

  // Filtered lists
  const filteredHouses = useMemo(() => {
    if (!houseSearch.trim()) return houses;
    const term = houseSearch.toLowerCase();
    return houses.filter(
      h =>
        h.name.toLowerCase().includes(term) ||
        h.location.toLowerCase().includes(term) ||
        h.tag?.toLowerCase().includes(term)
    );
  }, [houses, houseSearch]);

  const filteredRooms = useMemo(() => {
    let result = allRoomsList;
    if (roomHouseFilter !== 'all') {
      result = result.filter(item => item.house.id === roomHouseFilter);
    }
    if (roomSearch.trim()) {
      const term = roomSearch.toLowerCase();
      result = result.filter(
        item =>
          item.room.name.toLowerCase().includes(term) ||
          item.room.beds.toLowerCase().includes(term) ||
          item.room.view.toLowerCase().includes(term) ||
          item.house.name.toLowerCase().includes(term)
      );
    }
    return result;
  }, [allRoomsList, roomHouseFilter, roomSearch]);

  const filteredStories = useMemo(() => {
    if (!storySearch.trim()) return blogPosts;
    const term = storySearch.toLowerCase();
    return blogPosts.filter(
      b =>
        b.title.toLowerCase().includes(term) ||
        b.category.toLowerCase().includes(term) ||
        b.excerpt.toLowerCase().includes(term)
    );
  }, [blogPosts, storySearch]);

  // Gestión de alojamientos
  const handleOpenCreateHouse = () => {
    setEditingHouse(null);
    setHouseModalOpen(true);
  };

  const handleOpenEditHouse = (house: House) => {
    setEditingHouse(house);
    setHouseModalOpen(true);
  };

  const handleTriggerDeleteHouse = (house: House) => {
    const roomsCount = (roomsByHouse[house.id] || []).length;
    setDeleteTarget({
      type: 'house',
      id: house.id,
      title: house.name,
      warningNote:
        roomsCount > 0
          ? `Nota: Este alojamiento cuenta con ${roomsCount} habitación(es) vinculada(s). Al eliminarlo, también se darán de baja.`
          : undefined
    });
    setDeleteModalOpen(true);
  };

  // Gestión de habitaciones
  const handleOpenCreateRoom = (preSelectedHouseId?: string) => {
    setEditingRoom(null);
    setRoomTargetHouseId(preSelectedHouseId || (roomHouseFilter !== 'all' ? roomHouseFilter : houses[0]?.id ?? ''));
    setRoomModalOpen(true);
  };

  const handleOpenEditRoom = (room: Room, houseId: string) => {
    setEditingRoom(room);
    setRoomTargetHouseId(houseId);
    setRoomModalOpen(true);
  };

  const handleTriggerDeleteRoom = (room: Room, houseId: string) => {
    setDeleteTarget({
      type: 'room',
      id: room.id,
      houseId,
      title: `${room.name} (${houses.find(h => h.id === houseId)?.name || ''})`
    });
    setDeleteModalOpen(true);
  };

  const handleToggleRoomAvailability = (houseId: string, roomId: string) => {
    const targetRoom = (roomsByHouse[houseId] || []).find(r => r.id === roomId);
    if (!targetRoom || !onSaveRoom) return;
    const updated: Room = {
      ...targetRoom,
      available: !targetRoom.available
    };
    onSaveRoom(houseId, updated, true, houseId);
    showToast(`Habitación marcada como ${updated.available ? tHab.estadoDisponible : tHab.estadoOcupada}.`);
  };

  // Gestión de historias
  const handleOpenCreateStory = () => {
    setEditingStory(null);
    setStoryModalOpen(true);
  };

  const handleOpenEditStory = (story: BlogPost) => {
    setEditingStory(story);
    setStoryModalOpen(true);
  };

  const handleTriggerDeleteStory = (story: BlogPost) => {
    setDeleteTarget({
      type: 'story',
      id: story.id,
      title: `"${story.title}"`
    });
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'house' && onDeleteHouse) {
      onDeleteHouse(deleteTarget.id);
    } else if (deleteTarget.type === 'room' && onDeleteRoom && deleteTarget.houseId) {
      onDeleteRoom(deleteTarget.houseId, deleteTarget.id);
    } else if (deleteTarget.type === 'story' && onDeleteStory) {
      onDeleteStory(deleteTarget.id);
    }

    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const handleSendReply = () => {
    if (activeInquiry && replyText.trim()) {
      handleReplyInquiry(activeInquiry.id, replyText, 'host');
      setReplyText('');
    }
  };

  // Access guard
  if (!user || user.role !== 'host') {
    return (
      <div className="py-20 px-4 max-w-lg mx-auto text-center">
        <div className="bg-white border border-[rgba(63,67,77,0.1)] rounded-3xl p-8 sm:p-10 shadow-xl">
          <div className="h-16 w-16 rounded-3xl bg-amber-50 text-[#888B47] flex items-center justify-center mx-auto mb-5 shadow-sm">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-medium text-[#3F434D] mb-2">
            {tPan.accesoRestringido.titulo}
          </h2>
          <p className="text-xs text-[#6E727C] leading-relaxed mb-6">
            {tPan.accesoRestringido.descripcion}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => triggerLoginModal('signin')}
              className="w-full py-3 px-6 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#3F434D] text-[#FBF7EC] hover:bg-[#1E2024] shadow-md transition-all"
            >
              {tPan.accesoRestringido.botonIniciar}
            </button>
            <p className="text-[11px] text-[#A7AB5E] font-medium">
              {tPan.accesoRestringido.cuentasHabilitadas}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-[#A7AB5E] text-white px-3 py-1 rounded-full">
              👑 {tPan.badgePropietaria}
            </span>
            <span className="text-[10px] font-semibold text-[#6E727C] flex items-center gap-1">
              <Check className="h-3 w-3 text-emerald-600" /> {tPan.estadoGuardado}
            </span>
          </div>
          <h1 className="font-display font-light text-4xl sm:text-5xl text-[#3F434D] tracking-tight">
            {tPan.bienvenida}
          </h1>
          <p className="text-xs text-[#6E727C] mt-2 max-w-2xl">
            {tPan.descripcion}
          </p>
        </div>

        {/* Save button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleManualSave}
            disabled={isSaving || loadFailed}
            className={`py-2.5 px-6 rounded-full text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm ${
              hasUnsavedChanges
                ? 'bg-[#A7AB5E] text-white hover:bg-[#888B47] animate-pulse'
                : 'bg-white text-[#3F434D] border border-[rgba(63,67,77,0.12)] hover:bg-[#F5EFE0]'
            }`}
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> {tGen.guardando}
              </>
            ) : hasUnsavedChanges ? (
              <>
                <Sparkles className="h-3.5 w-3.5" /> {tGen.guardarCambios}
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" /> {tGen.todoGuardado}
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Stats Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
        <div 
          onClick={() => setDashActiveTab('casas')}
          className="bg-white border border-[rgba(63,67,77,0.06)] rounded-3xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#6E727C]">{tPan.estadisticas.casasActivas}</span>
            <div className="h-7 w-7 rounded-full bg-[#F5EFE0] text-[#3D7A95] flex items-center justify-center group-hover:bg-[#3D7A95] group-hover:text-white transition-colors">
              <Home className="h-3.5 w-3.5" />
            </div>
          </div>
          <h3 className="font-display text-3xl font-extrabold text-[#3F434D] tracking-tight mt-1">
            {houses.length}
          </h3>
          <p className="text-[9px] uppercase tracking-wider font-bold text-[#3D7A95] mt-1">
            {tPan.estadisticas.verCasas} →
          </p>
        </div>

        <div 
          onClick={() => setDashActiveTab('habitaciones')}
          className="bg-white border border-[rgba(63,67,77,0.06)] rounded-3xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#6E727C]">{tPan.estadisticas.habitaciones}</span>
            <div className="h-7 w-7 rounded-full bg-[#F5EFE0] text-[#A7AB5E] flex items-center justify-center group-hover:bg-[#A7AB5E] group-hover:text-white transition-colors">
              <Bed className="h-3.5 w-3.5" />
            </div>
          </div>
          <h3 className="font-display text-3xl font-extrabold text-[#A7AB5E] tracking-tight mt-1">
            {allRoomsList.length}
          </h3>
          <p className="text-[9px] uppercase tracking-wider font-bold text-[#6E727C] mt-1">
            {totalAvailableRooms} {tPan.estadisticas.libres} · {totalOccupiedRooms} {tPan.estadisticas.ocupadas}
          </p>
        </div>

        <div 
          onClick={() => setDashActiveTab('historias')}
          className="bg-white border border-[rgba(63,67,77,0.06)] rounded-3xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#6E727C]">{tPan.estadisticas.historias}</span>
            <div className="h-7 w-7 rounded-full bg-[#F5EFE0] text-[#3D7A95] flex items-center justify-center group-hover:bg-[#3D7A95] group-hover:text-white transition-colors">
              <BookOpen className="h-3.5 w-3.5" />
            </div>
          </div>
          <h3 className="font-display text-3xl font-extrabold text-[#3F434D] tracking-tight mt-1">
            {blogPosts.length}
          </h3>
          <p className="text-[9px] uppercase tracking-wider font-bold text-[#3D7A95] mt-1">
            {tPan.estadisticas.verHistorias}
          </p>
        </div>

        <div 
          onClick={() => setDashActiveTab('inquiries')}
          className="bg-white border border-[rgba(63,67,77,0.06)] rounded-3xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#6E727C]">{tPan.estadisticas.consultas}</span>
            <div className="h-7 w-7 rounded-full bg-[#F5EFE0] text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <MessageSquare className="h-3.5 w-3.5" />
            </div>
          </div>
          <h3 className="font-display text-3xl font-extrabold text-[#3F434D] tracking-tight mt-1">
            {inquiries.filter(i => !i.read).length}
          </h3>
          <p className="text-[9px] uppercase tracking-wider font-bold text-[#6E727C] mt-1">
            {tPan.estadisticas.mensajesPendientes}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 flex-wrap mb-8 border-b border-[rgba(63,67,77,0.08)] pb-4">
        <button
          onClick={() => setDashActiveTab('casas')}
          className={`py-2.5 px-5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
            dashActiveTab === 'casas' || dashActiveTab === 'listings'
              ? 'bg-[#3F434D] text-[#FBF7EC] shadow-md'
              : 'bg-white text-[#6E727C] hover:text-[#3F434D] border border-[rgba(63,67,77,0.08)]'
          }`}
        >
          <Home className="h-3.5 w-3.5" />
          {tPan.pestanas.casas} ({houses.length})
        </button>

        <button
          onClick={() => setDashActiveTab('habitaciones')}
          className={`py-2.5 px-5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
            dashActiveTab === 'habitaciones'
              ? 'bg-[#3F434D] text-[#FBF7EC] shadow-md'
              : 'bg-white text-[#6E727C] hover:text-[#3F434D] border border-[rgba(63,67,77,0.08)]'
          }`}
        >
          <Bed className="h-3.5 w-3.5" />
          {tPan.pestanas.habitaciones} ({allRoomsList.length})
        </button>

        <button
          onClick={() => setDashActiveTab('historias')}
          className={`py-2.5 px-5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
            dashActiveTab === 'historias' || dashActiveTab === 'stories'
              ? 'bg-[#3F434D] text-[#FBF7EC] shadow-md'
              : 'bg-white text-[#6E727C] hover:text-[#3F434D] border border-[rgba(63,67,77,0.08)]'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          {tPan.pestanas.historias} ({blogPosts.length})
        </button>

        <button
          onClick={() => setDashActiveTab('inquiries')}
          className={`py-2.5 px-5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
            dashActiveTab === 'inquiries'
              ? 'bg-[#3F434D] text-[#FBF7EC] shadow-md'
              : 'bg-white text-[#6E727C] hover:text-[#3F434D] border border-[rgba(63,67,77,0.08)]'
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          {tPan.pestanas.consultas}{' '}
          {inquiries.filter(i => !i.read).length > 0 && (
            <span className="h-4.5 min-w-4.5 px-1 bg-[#A7AB5E] text-white rounded-full text-[9px] font-bold flex items-center justify-center">
              {inquiries.filter(i => !i.read).length}
            </span>
          )}
        </button>

        <button
          onClick={() => setDashActiveTab('settings')}
          className={`py-2.5 px-5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
            dashActiveTab === 'settings'
              ? 'bg-[#3F434D] text-[#FBF7EC] shadow-md'
              : 'bg-white text-[#6E727C] hover:text-[#3F434D] border border-[rgba(63,67,77,0.08)]'
          }`}
        >
          <Settings className="h-3.5 w-3.5" />
          {tPan.pestanas.ajustes}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 1: ALOJAMIENTOS                                                   */}
      {/* ========================================================================= */}
      {(dashActiveTab === 'casas' || dashActiveTab === 'listings') && (
        <div className="space-y-6">
          {/* Action bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-[rgba(63,67,77,0.08)] shadow-sm">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder={tCas.buscarPlaceholder}
                value={houseSearch}
                onChange={(e) => setHouseSearch(e.target.value)}
                className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.1)] py-2 pl-9 pr-3 rounded-xl text-xs outline-none focus:border-[#3D7A95]"
              />
              <Search className="h-4 w-4 text-[#6E727C] absolute left-3 top-2.5" />
            </div>

            <button
              onClick={handleOpenCreateHouse}
              className="py-2.5 px-5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#A7AB5E] text-white hover:bg-[#888B47] shadow-md transition-all flex items-center gap-2 shrink-0"
            >
              <Plus className="h-4 w-4" />
              {tCas.botonNueva}
            </button>
          </div>

          {/* Houses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHouses.map((house) => {
              const houseRooms = roomsByHouse[house.id] || [];
              return (
                <div
                  key={house.id}
                  className="bg-white rounded-3xl overflow-hidden border border-[rgba(63,67,77,0.08)] shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Image banner with badges */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                      <img
                        src={house.images[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'}
                        alt={house.name}
                        className="w-full h-full object-cover"
                      />
                      {house.tag && (
                        <span className="absolute top-3 left-3 bg-white text-[#3F434D] font-bold text-[10px] tracking-wider uppercase py-1 px-3 rounded-full shadow-md">
                          {house.tag}
                        </span>
                      )}
                      <span className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                        {house.images.length} {house.images.length === 1 ? 'foto' : 'fotos'}
                      </span>
                    </div>

                    {/* House Details */}
                    <div className="p-5">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#3D7A95] mb-1">
                        <MapPin className="h-3 w-3" /> {house.location}
                      </div>
                      <h3 className="font-display font-medium text-xl text-[#3F434D] mb-2 leading-snug">
                        {house.name}
                      </h3>
                      <p className="text-xs text-[#6E727C] line-clamp-2 leading-relaxed mb-4">
                        {house.description}
                      </p>

                      <div className="grid grid-cols-3 gap-2 py-3 border-y border-[rgba(63,67,77,0.06)] text-center text-xs">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#6E727C] block">{tCas.baseNoche}</span>
                          <span className="font-bold text-[#3F434D]">€{house.pricePerNight}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#6E727C] block">{tCas.habitaciones}</span>
                          <span className="font-bold text-[#A7AB5E]">{houseRooms.length}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#6E727C] block">{tCas.capacidad}</span>
                          <span className="font-bold text-[#3F434D]">{tCas.maxHuespedes} {house.guests}</span>
                        </div>
                      </div>

                      {/* Amenities chips */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {house.features.slice(0, 3).map((f, idx) => (
                          <span key={idx} className="bg-[#FBF7EC] text-[#6E727C] text-[10px] px-2 py-0.5 rounded-md font-medium">
                            {f}
                          </span>
                        ))}
                        {house.features.length > 3 && (
                          <span className="text-[10px] text-[#A7AB5E] font-semibold self-center">
                            +{house.features.length - 3} más
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 bg-[#FBF7EC] border-t border-[rgba(63,67,77,0.06)] flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setRoomHouseFilter(house.id);
                        setDashActiveTab('habitaciones');
                      }}
                      className="py-1.5 px-3 bg-white border border-[rgba(63,67,77,0.1)] hover:bg-[#F5EFE0] rounded-xl text-[10px] font-bold uppercase tracking-wider text-[#3D7A95] flex items-center gap-1 transition-colors"
                      title="Ver y gestionar habitaciones de este alojamiento"
                    >
                      <Bed className="h-3 w-3" /> {tCas.verHabitaciones} ({houseRooms.length})
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleNavigate('detail', { houseId: house.id })}
                        className="h-8 w-8 rounded-xl bg-white border border-[rgba(63,67,77,0.1)] hover:bg-[#F5EFE0] text-[#6E727C] flex items-center justify-center transition-colors"
                        title={tCas.verEnWeb}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenEditHouse(house)}
                        className="py-1.5 px-3 bg-white border border-[rgba(63,67,77,0.1)] hover:bg-[#3F434D] hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wider text-[#3F434D] flex items-center gap-1 transition-all"
                      >
                        <Edit3 className="h-3 w-3" /> {tGen.editar}
                      </button>

                      <button
                        onClick={() => handleTriggerDeleteHouse(house)}
                        className="h-8 w-8 rounded-xl bg-white border border-[rgba(63,67,77,0.1)] hover:bg-red-50 text-red-600 flex items-center justify-center transition-colors"
                        title={tGen.eliminar}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredHouses.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-[rgba(63,67,77,0.08)] p-8">
              <Home className="h-10 w-10 text-[#6E727C] mx-auto mb-3" />
              <h4 className="font-display font-medium text-lg text-[#3F434D] mb-1">{tGen.sinResultados}</h4>
              <p className="text-xs text-[#6E727C] mb-4">Intenta cambiar la búsqueda o añade un nuevo alojamiento.</p>
              <button
                onClick={handleOpenCreateHouse}
                className="py-2.5 px-6 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#A7AB5E] text-white hover:bg-[#888B47]"
              >
                + {tCas.botonNueva}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECCIÓN 2: HABITACIONES Y TARIFAS                                         */}
      {/* ========================================================================= */}
      {dashActiveTab === 'habitaciones' && (
        <div className="space-y-6">
          {/* Action bar with House filter */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-[rgba(63,67,77,0.08)] shadow-sm">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#6E727C]" />
                <select
                  value={roomHouseFilter}
                  onChange={(e) => setRoomHouseFilter(e.target.value)}
                  className="bg-[#FBF7EC] border border-[rgba(63,67,77,0.1)] py-2 px-3 rounded-xl text-xs font-semibold text-[#3F434D] outline-none"
                >
                  <option value="all">{tHab.filtroTodas} ({allRoomsList.length} hab.)</option>
                  {houses.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({(roomsByHouse[h.id] || []).length})
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  placeholder={tHab.buscarPlaceholder}
                  value={roomSearch}
                  onChange={(e) => setRoomSearch(e.target.value)}
                  className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.1)] py-2 pl-9 pr-3 rounded-xl text-xs outline-none focus:border-[#3D7A95]"
                />
                <Search className="h-4 w-4 text-[#6E727C] absolute left-3 top-2.5" />
              </div>
            </div>

            <button
              onClick={() => handleOpenCreateRoom(roomHouseFilter !== 'all' ? roomHouseFilter : undefined)}
              className="py-2.5 px-5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#A7AB5E] text-white hover:bg-[#888B47] shadow-md transition-all flex items-center gap-2 shrink-0"
            >
              <Plus className="h-4 w-4" />
              {tHab.botonNueva}
            </button>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map(({ room, house }) => (
              <div
                key={`${house.id}-${room.id}`}
                className="bg-white rounded-3xl overflow-hidden border border-[rgba(63,67,77,0.08)] shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Photo & Availability badge */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                    <img
                      src={room.images[0] || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600'}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      <span className="bg-white/90 backdrop-blur-sm text-[#3D7A95] font-bold text-[9px] uppercase px-2.5 py-1 rounded-full shadow">
                        🏡 {house.name}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => handleToggleRoomAvailability(house.id, room.id)}
                        className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 transition-colors ${
                          room.available
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                            : 'bg-stone-600 text-white hover:bg-stone-700'
                        }`}
                        title="Clic para cambiar disponibilidad"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                        {room.available ? tHab.estadoDisponible : tHab.estadoOcupada}
                      </button>
                    </div>

                    <span className="absolute bottom-3 right-3 bg-black/60 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full">
                      {room.images.length} {room.images.length === 1 ? 'foto' : 'fotos'}
                    </span>
                  </div>

                  {/* Room details */}
                  <div className="p-5">
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <h4 className="font-display font-medium text-lg text-[#3F434D] leading-snug">
                        {room.name}
                      </h4>
                      <div className="text-right shrink-0">
                        <span className="font-display text-lg font-bold text-[#3F434D]">€{room.price}</span>
                        <span className="text-[9px] text-[#6E727C] block font-semibold">/ noche</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#6E727C] line-clamp-2 leading-relaxed mb-4">
                      {room.description}
                    </p>

                    <div className="space-y-1.5 text-xs text-[#6E727C] bg-[#FBF7EC] p-3 rounded-2xl border border-[rgba(63,67,77,0.06)]">
                      <div className="flex items-center gap-2">
                        <Bed className="h-3.5 w-3.5 text-[#3D7A95]" />
                        <span className="font-medium text-[#3F434D]">{room.beds}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="h-3.5 w-3.5 text-[#A7AB5E]" />
                        <span className="font-medium text-[#3F434D]">{room.view}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-4 bg-[#FBF7EC] border-t border-[rgba(63,67,77,0.06)] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleRoomAvailability(house.id, room.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                        room.available ? 'bg-emerald-500' : 'bg-gray-400'
                      }`}
                      title="Alternar estado libre/ocupado"
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          room.available ? 'translate-x-4.5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                    <span className="text-[10px] font-semibold text-[#6E727C]">
                      {room.available ? tHab.estadoDisponible : tHab.estadoOcupada}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditRoom(room, house.id)}
                      className="py-1.5 px-3 bg-white border border-[rgba(63,67,77,0.1)] hover:bg-[#3F434D] hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wider text-[#3F434D] flex items-center gap-1 transition-all"
                    >
                      <Edit3 className="h-3 w-3" /> {tGen.editar}
                    </button>

                    <button
                      onClick={() => handleTriggerDeleteRoom(room, house.id)}
                      className="h-8 w-8 rounded-xl bg-white border border-[rgba(63,67,77,0.1)] hover:bg-red-50 text-red-600 flex items-center justify-center transition-colors"
                      title={tGen.eliminar}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredRooms.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-[rgba(63,67,77,0.08)] p-8">
              <Bed className="h-10 w-10 text-[#6E727C] mx-auto mb-3" />
              <h4 className="font-display font-medium text-lg text-[#3F434D] mb-1">
                {tGen.sinResultados}
              </h4>
              <p className="text-xs text-[#6E727C] mb-4">
                Puedes añadir una nueva habitación asignándola a cualquiera de tus alojamientos.
              </p>
              <button
                onClick={() => handleOpenCreateRoom()}
                className="py-2.5 px-6 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#A7AB5E] text-white hover:bg-[#888B47]"
              >
                + {tHab.botonNueva}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECCIÓN 3: HISTORIAS Y GUÍAS                                              */}
      {/* ========================================================================= */}
      {(dashActiveTab === 'historias' || dashActiveTab === 'stories') && (
        <div className="space-y-6">
          {/* Action bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-[rgba(63,67,77,0.08)] shadow-sm">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder={tHis.buscarPlaceholder}
                value={storySearch}
                onChange={(e) => setStorySearch(e.target.value)}
                className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.1)] py-2 pl-9 pr-3 rounded-xl text-xs outline-none focus:border-[#3D7A95]"
              />
              <Search className="h-4 w-4 text-[#6E727C] absolute left-3 top-2.5" />
            </div>

            <button
              onClick={handleOpenCreateStory}
              className="py-2.5 px-5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#A7AB5E] text-white hover:bg-[#888B47] shadow-md transition-all flex items-center gap-2 shrink-0"
            >
              <Plus className="h-4 w-4" />
              {tHis.botonNueva}
            </button>
          </div>

          {/* Stories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-3xl overflow-hidden border border-[rgba(63,67,77,0.08)] shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                    <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 bg-white text-[#3F434D] font-bold text-[10px] tracking-wider uppercase py-1 px-3 rounded-full shadow-md">
                      {story.category}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1">
                      {story.publishedDate} · {story.readTime}
                    </div>
                    <h3 className="font-display font-medium text-xl text-[#3F434D] mb-2 leading-snug">
                      {story.title}
                    </h3>
                    <p className="text-xs text-[#6E727C] line-clamp-3 leading-relaxed mb-4">
                      {story.excerpt}
                    </p>
                    <div className="text-[10px] text-[#A7AB5E] font-semibold">
                      Por {story.author}
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-4 bg-[#FBF7EC] border-t border-[rgba(63,67,77,0.06)] flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleNavigate('blog')}
                    className="py-1.5 px-3 bg-white border border-[rgba(63,67,77,0.1)] hover:bg-[#F5EFE0] rounded-xl text-[10px] font-bold uppercase tracking-wider text-[#3D7A95] flex items-center gap-1 transition-colors"
                  >
                    <Eye className="h-3 w-3" /> {tHis.verEnBlog}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditStory(story)}
                      className="py-1.5 px-3 bg-white border border-[rgba(63,67,77,0.1)] hover:bg-[#3F434D] hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wider text-[#3F434D] flex items-center gap-1 transition-all"
                    >
                      <Edit3 className="h-3 w-3" /> {tGen.editar}
                    </button>

                    <button
                      onClick={() => handleTriggerDeleteStory(story)}
                      className="h-8 w-8 rounded-xl bg-white border border-[rgba(63,67,77,0.1)] hover:bg-red-50 text-red-600 flex items-center justify-center transition-colors"
                      title={tGen.eliminar}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredStories.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-[rgba(63,67,77,0.08)] p-8">
              <BookOpen className="h-10 w-10 text-[#6E727C] mx-auto mb-3" />
              <h4 className="font-display font-medium text-lg text-[#3F434D] mb-1">
                {tGen.sinResultados}
              </h4>
              <p className="text-xs text-[#6E727C] mb-4">
                Comparte rincones secretos de Gran Canaria, senderos y recomendaciones con tus huéspedes.
              </p>
              <button
                onClick={handleOpenCreateStory}
                className="py-2.5 px-6 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#A7AB5E] text-white hover:bg-[#888B47]"
              >
                + {tHis.botonNueva}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECCIÓN 4: CONSULTAS & MENSAJES                                           */}
      {/* ========================================================================= */}
      {dashActiveTab === 'inquiries' && (
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
      )}

      {/* ========================================================================= */}
      {/* SECCIÓN 5: PERFIL DE ANFITRIONA                                           */}
      {/* ========================================================================= */}
      {dashActiveTab === 'settings' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white border border-[rgba(63,67,77,0.1)] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div>
              <h3 className="font-display font-medium text-xl text-[#3F434D] mb-1">
                Automatizaciones de Reseñas
              </h3>
              <p className="text-xs text-[#6E727C]">
                Configura los avisos automáticos para que los huéspedes califiquen su estancia al hacer check-out.
              </p>

              <div className="border-t border-[rgba(63,67,77,0.08)] mt-4 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#3F434D]">
                    Disparadores automáticos por email
                  </span>
                  <button className="h-6 w-11 inline-flex items-center rounded-full bg-[#A7AB5E] focus:outline-none">
                    <span className="h-4 w-4 transform rounded-full bg-white translate-x-6" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#3F434D]">
                    Banner visible en web tras check-out
                  </span>
                  <button className="h-6 w-11 inline-flex items-center rounded-full bg-[#A7AB5E] focus:outline-none">
                    <span className="h-4 w-4 transform rounded-full bg-white translate-x-6" />
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-[rgba(63,67,77,0.08)] pt-6">
              <h3 className="font-display font-medium text-xl text-[#3F434D] mb-4">
                Biografía y Datos de Contacto de Mila
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">
                    Nombre Público de la Anfitriona
                  </label>
                  <input
                    type="text"
                    value={hostProfile.name}
                    onChange={(e) => {
                      setHostProfile(prev => ({ ...prev, name: e.target.value }));
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-2.5 px-4 rounded-xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">
                    Título / Subtítulo
                  </label>
                  <input
                    type="text"
                    value={hostProfile.title}
                    onChange={(e) => {
                      setHostProfile(prev => ({ ...prev, title: e.target.value }));
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-2.5 px-4 rounded-xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">
                    Biografía
                  </label>
                  <textarea
                    rows={4}
                    value={hostProfile.bio}
                    onChange={(e) => {
                      setHostProfile(prev => ({ ...prev, bio: e.target.value }));
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-3 px-4 rounded-xl text-xs outline-none resize-vertical"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      value={hostProfile.phone}
                      onChange={(e) => {
                        setHostProfile(prev => ({ ...prev, phone: e.target.value }));
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-2.5 px-4 rounded-xl text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">
                      Email de contacto
                    </label>
                    <input
                      type="email"
                      value={hostProfile.email}
                      onChange={(e) => {
                        setHostProfile(prev => ({ ...prev, email: e.target.value }));
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-2.5 px-4 rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">
                    Dirección Principal
                  </label>
                  <input
                    type="text"
                    value={hostProfile.address}
                    onChange={(e) => {
                      setHostProfile(prev => ({ ...prev, address: e.target.value }));
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-2.5 px-4 rounded-xl text-xs outline-none"
                  />
                </div>
                <button
                  onClick={handleManualSave}
                  className="py-2.5 px-6 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#3F434D] text-[#FBF7EC] hover:bg-[#1E2024] shadow-md transition-all"
                >
                  Guardar Perfil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALES: ALOJAMIENTO, HABITACIÓN, HISTORIA, ELIMINAR                      */}
      {/* ========================================================================= */}
      <HouseModal
        isOpen={houseModalOpen}
        onClose={() => setHouseModalOpen(false)}
        onSave={(house, isEdit) => {
          if (onSaveHouse) onSaveHouse(house, isEdit);
        }}
        initialHouse={editingHouse}
      />

      <RoomModal
        isOpen={roomModalOpen}
        onClose={() => setRoomModalOpen(false)}
        onSave={(targetHouseId, room, isEdit, originalHouseId) => {
          if (onSaveRoom) onSaveRoom(targetHouseId, room, isEdit, originalHouseId);
        }}
        houses={houses}
        defaultHouseId={roomTargetHouseId}
        initialRoom={editingRoom}
        initialHouseId={roomTargetHouseId}
      />

      <StoryModal
        isOpen={storyModalOpen}
        onClose={() => setStoryModalOpen(false)}
        onSave={(story, isEdit) => {
          if (onSaveStory) onSaveStory(story, isEdit);
        }}
        initialStory={editingStory}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        title={
          deleteTarget?.type === 'house'
            ? tCas.confirmarEliminar.titulo
            : deleteTarget?.type === 'room'
            ? tHab.confirmarEliminar.titulo
            : tHis.confirmarEliminar.titulo
        }
        message={
          deleteTarget?.type === 'house'
            ? tCas.confirmarEliminar.mensaje
            : deleteTarget?.type === 'room'
            ? tHab.confirmarEliminar.mensaje
            : tHis.confirmarEliminar.mensaje
        }
        itemDescription={deleteTarget?.title}
        warningNote={deleteTarget?.warningNote}
        confirmText={
          deleteTarget?.type === 'house'
            ? tCas.confirmarEliminar.botonConfirmar
            : deleteTarget?.type === 'room'
            ? tHab.confirmarEliminar.botonConfirmar
            : tHis.confirmarEliminar.botonConfirmar
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
