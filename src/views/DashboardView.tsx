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

import { PropertiesTab } from './Dashboard/Tabs/PropertiesTab';
import { StoriesTab } from './Dashboard/Tabs/StoriesTab';
import { InquiriesTab } from './Dashboard/Tabs/InquiriesTab';
import { SettingsTab } from './Dashboard/Tabs/SettingsTab';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';

interface DashboardViewProps {
  user?: { name: string; email: string; role: 'guest' | 'host' } | null;
  triggerLoginModal?: (tab?: 'signin' | 'signup') => void;
  dashActiveTab?: string;
  setDashActiveTab?: (tab: string) => void;
  inquiries?: MessageInquiry[];
  setInquiries?: React.Dispatch<React.SetStateAction<MessageInquiry[]>>;
  toggleInquiryRead?: (id: string) => void;
  houses?: House[];
  blogPosts?: BlogPost[];
  setBlogPosts?: React.Dispatch<React.SetStateAction<BlogPost[]>>;
  hostProfile?: HostProfile;
  setHostProfile?: React.Dispatch<React.SetStateAction<HostProfile>>;
  selectedHouseId?: string;
  setSelectedHouseId?: (id: string) => void;
  activeHouse?: House;
  roomsByHouse?: Record<string, Room[]>;
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
  showToast?: (msg: string) => void;
  newBlogTitle?: string;
  setNewBlogTitle?: (title: string) => void;
  newBlogCategory?: string;
  setNewBlogCategory?: (category: string) => void;
  newBlogExcerpt?: string;
  setNewBlogExcerpt?: (excerpt: string) => void;
  newBlogContent?: string;
  setNewBlogContent?: (content: string) => void;
  handlePublishStory?: () => void;
  handleReplyInquiry?: (id: string, message: string, role: 'host' | 'guest') => void;
  handleNavigate?: (page: string, params?: { houseId?: string; blogId?: string }) => void;
  loadFailed?: boolean;
  hasUnsavedChanges?: boolean;
  setHasUnsavedChanges?: (val: boolean) => void;
  isSaving?: boolean;
  handleManualSave?: () => void;

  onSaveHouse?: (house: House, isEdit: boolean) => void;
  onDeleteHouse?: (houseId: string) => void;
  onSaveRoom?: (targetHouseId: string, room: Room, isEdit: boolean, originalHouseId?: string) => void;
  onDeleteRoom?: (houseId: string, roomId: string) => void;
  onSaveStory?: (story: BlogPost, isEdit: boolean) => void;
  onDeleteStory?: (storyId: string) => void;
}

export function DashboardView(props: DashboardViewProps) {
  const navigate = useNavigate();
  const { user: ctxUser, triggerLoginModal: ctxTriggerLoginModal } = useAuth();
  const {
    houses: ctxHouses,
    roomsByHouse: ctxRoomsByHouse,
    inquiries: ctxInquiries,
    blogPosts: ctxBlogPosts,
    hostProfile: ctxHostProfile,
    setHostProfile: ctxSetHostProfile,
    loadFailed: ctxLoadFailed,
    hasUnsavedChanges: ctxHasUnsavedChanges,
    setHasUnsavedChanges: ctxSetHasUnsavedChanges,
    isSaving: ctxIsSaving,
    saveHostProfile,
    saveHouse,
    deleteHouse,
    saveRoom,
    deleteRoom,
    saveStory,
    deleteStory,
    replyInquiry,
    toggleInquiryRead: ctxToggleInquiryRead,
  } = useData();
  const { showToast: ctxShowToast } = useToast();

  const user = props.user !== undefined ? props.user : ctxUser;
  const triggerLoginModal = props.triggerLoginModal || ctxTriggerLoginModal;
  const showToast = props.showToast || ctxShowToast;
  const houses = props.houses || ctxHouses;
  const roomsByHouse = props.roomsByHouse || ctxRoomsByHouse;
  const inquiries = props.inquiries || ctxInquiries;
  const blogPosts = props.blogPosts || ctxBlogPosts;
  const hostProfile = props.hostProfile || ctxHostProfile;
  const setHostProfile = props.setHostProfile || ctxSetHostProfile;
  const loadFailed = props.loadFailed !== undefined ? props.loadFailed : ctxLoadFailed;
  const hasUnsavedChanges = props.hasUnsavedChanges !== undefined ? props.hasUnsavedChanges : ctxHasUnsavedChanges;
  const setHasUnsavedChanges = props.setHasUnsavedChanges || ctxSetHasUnsavedChanges;
  const isSaving = props.isSaving !== undefined ? props.isSaving : ctxIsSaving;

  const [localDashTab, setLocalDashTab] = useState<string>('listings');
  const dashActiveTab = props.dashActiveTab || localDashTab;
  const setDashActiveTab = props.setDashActiveTab || setLocalDashTab;

  const [localSelectedHouseId, setLocalSelectedHouseId] = useState<string>(houses[0]?.id || '');
  const selectedHouseId = props.selectedHouseId || localSelectedHouseId || houses[0]?.id || '';
  const setSelectedHouseId = props.setSelectedHouseId || setLocalSelectedHouseId;

  const activeHouse = props.activeHouse || houses.find(h => h.id === selectedHouseId) || houses[0];

  const handleNavigate = props.handleNavigate || ((page: string, params?: { houseId?: string; blogId?: string }) => {
    if (page === 'detail' && params?.houseId) {
      navigate(`/alojamiento/${params.houseId}`);
    } else if (page === 'home') {
      navigate('/');
    } else if (page === 'blog') {
      navigate('/historias');
    } else if (page === 'contact') {
      navigate('/contacto');
    } else if (page === 'inbox') {
      navigate('/mensajes');
    }
  });

  const onSaveHouse = props.onSaveHouse || (async (h: House, isEdit: boolean) => {
    const res = await saveHouse(h, isEdit);
    if (res.success) {
      showToast(isEdit ? `Alojamiento "${h.name}" actualizado.` : `Alojamiento "${h.name}" creado con éxito.`);
    } else {
      showToast('Error al guardar: ' + (res.error || 'Error'));
    }
  });

  const onDeleteHouse = props.onDeleteHouse || (async (hId: string) => {
    const target = houses.find(h => h.id === hId);
    const res = await deleteHouse(hId);
    if (res.success) {
      showToast(`Alojamiento "${target?.name || hId}" eliminado.`);
    } else {
      showToast('Error al eliminar: ' + (res.error || 'Error'));
    }
  });

  const onSaveRoom = props.onSaveRoom || (async (tHouseId: string, r: Room, isEdit: boolean, origHouseId?: string) => {
    const res = await saveRoom(tHouseId, r, isEdit, origHouseId);
    if (res.success) {
      showToast(isEdit ? `Habitación "${r.name}" actualizada.` : `Habitación "${r.name}" creada con éxito.`);
    } else {
      showToast('Error al guardar: ' + (res.error || 'Error'));
    }
  });

  const onDeleteRoom = props.onDeleteRoom || (async (hId: string, rId: string) => {
    const room = (roomsByHouse[hId] || []).find(r => r.id === rId);
    const res = await deleteRoom(hId, rId);
    if (res.success) {
      showToast(`Habitación "${room?.name || rId}" eliminada.`);
    } else {
      showToast('Error al eliminar: ' + (res.error || 'Error'));
    }
  });

  const onSaveStory = props.onSaveStory || (async (s: BlogPost, isEdit: boolean) => {
    const res = await saveStory(s, isEdit);
    if (res.success) {
      showToast(isEdit ? `Historia "${s.title}" actualizada.` : `Historia "${s.title}" publicada en el blog.`);
    } else {
      showToast('Error al guardar: ' + (res.error || 'Error'));
    }
  });

  const onDeleteStory = props.onDeleteStory || (async (sId: string) => {
    const story = blogPosts.find(b => b.id === sId);
    const res = await deleteStory(sId);
    if (res.success) {
      showToast(`Historia "${story?.title || sId}" eliminada.`);
    } else {
      showToast('Error al eliminar: ' + (res.error || 'Error'));
    }
  });

  const toggleInquiryRead = props.toggleInquiryRead || (async (id: string) => {
    await ctxToggleInquiryRead(id);
  });

  const handleReplyInquiry = props.handleReplyInquiry || (async (id: string, msg: string, role: 'host' | 'guest') => {
    const res = await replyInquiry(id, msg, role);
    if (res.success) {
      showToast('✉️ Respuesta enviada con éxito.');
    } else {
      showToast('Error al enviar respuesta: ' + (res.error || 'Error'));
    }
  });

  const handleManualSave = props.handleManualSave || (async () => {
    const ok = await saveHostProfile(hostProfile);
    if (ok) {
      showToast(textos.notificaciones.datosSincronizados);
    } else {
      showToast(textos.notificaciones.errorGuardar);
    }
  });
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
      </div>

      {/* Segmented Control Navigation (Floating Pill) */}
      <div className="flex justify-center mb-10 mt-2">
        <div className="relative flex p-1.5 bg-white/90 backdrop-blur-xl border border-[rgba(63,67,77,0.1)] shadow-sm rounded-full w-full max-w-4xl mx-auto">
          
          {/* Sliding Active Background Indicator */}
          <div 
            className="absolute top-1.5 bottom-1.5 bg-[#3F434D] rounded-full transition-transform duration-300 ease-out shadow-md"
            style={{
              width: 'calc(25% - 3px)',
              left: '6px',
              transform: 
                (dashActiveTab === 'casas' || dashActiveTab === 'listings' || dashActiveTab === 'habitaciones') ? 'translateX(0%)' :
                (dashActiveTab === 'historias' || dashActiveTab === 'stories') ? 'translateX(100%)' : 
                (dashActiveTab === 'inquiries') ? 'translateX(200%)' :
                'translateX(300%)'
            }}
          />

          {/* TAB 1: Alojamientos */}
          <button
            onClick={() => setDashActiveTab('casas')}
            className={`relative z-10 w-1/4 flex items-center justify-center gap-2 py-2.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors duration-300 group ${
              dashActiveTab === 'casas' || dashActiveTab === 'listings' || dashActiveTab === 'habitaciones'
                ? 'text-white'
                : 'text-[#6E727C] hover:text-[#3F434D]'
            }`}
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Alojamientos</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
              dashActiveTab === 'casas' || dashActiveTab === 'listings' || dashActiveTab === 'habitaciones'
                ? 'bg-white/20 text-white' : 'bg-[#FBF7EC] text-[#6E727C] group-hover:bg-[#F5EFE0]'
            }`}>
              {houses.length}
            </span>
          </button>

          {/* TAB 2: Historias */}
          <button
            onClick={() => setDashActiveTab('historias')}
            className={`relative z-10 w-1/4 flex items-center justify-center gap-2 py-2.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors duration-300 group ${
              dashActiveTab === 'historias' || dashActiveTab === 'stories'
                ? 'text-white'
                : 'text-[#6E727C] hover:text-[#3F434D]'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">{tPan.estadisticas.historias}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
              dashActiveTab === 'historias' || dashActiveTab === 'stories'
                ? 'bg-white/20 text-white' : 'bg-[#FBF7EC] text-[#6E727C] group-hover:bg-[#F5EFE0]'
            }`}>
              {blogPosts.length}
            </span>
          </button>

          {/* TAB 3: Consultas */}
          <button
            onClick={() => setDashActiveTab('inquiries')}
            className={`relative z-10 w-1/4 flex items-center justify-center gap-2 py-2.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors duration-300 group ${
              dashActiveTab === 'inquiries'
                ? 'text-white'
                : 'text-[#6E727C] hover:text-[#3F434D]'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">{tPan.estadisticas.consultas}</span>
            
            {inquiries.filter(i => !i.read).length > 0 ? (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors flex items-center gap-1.5 ${
                dashActiveTab === 'inquiries'
                  ? 'bg-amber-500 text-white shadow-inner' : 'bg-amber-100 text-amber-700 group-hover:bg-amber-200'
              }`}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                </span>
                {inquiries.filter(i => !i.read).length}
              </span>
            ) : (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                dashActiveTab === 'inquiries'
                  ? 'bg-white/20 text-white' : 'bg-[#FBF7EC] text-[#6E727C] group-hover:bg-[#F5EFE0]'
              }`}>
                0
              </span>
            )}
          </button>

          {/* TAB 4: Perfil de Anfitriona */}
          <button
            onClick={() => setDashActiveTab('settings')}
            className={`relative z-10 w-1/4 flex items-center justify-center gap-2 py-2.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors duration-300 group ${
              dashActiveTab === 'settings'
                ? 'text-white'
                : 'text-[#6E727C] hover:text-[#3F434D]'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">{tPan.pestanas.ajustes}</span>
          </button>
        </div>
      </div>



      {/* ========================================================================= */}
      {/* SECCIÓN 1: ALOJAMIENTOS Y HABITACIONES                                    */}
      {/* ========================================================================= */}
      {(dashActiveTab === 'casas' || dashActiveTab === 'listings' || dashActiveTab === 'habitaciones') && (
        <PropertiesTab 
          tCas={tCas} tHab={tHab} tGen={tGen}
          houseSearch={houseSearch} setHouseSearch={setHouseSearch}
          handleOpenCreateHouse={handleOpenCreateHouse} filteredHouses={filteredHouses}
          roomsByHouse={roomsByHouse} setRoomHouseFilter={setRoomHouseFilter}
          setDashActiveTab={setDashActiveTab} handleNavigate={handleNavigate}
          handleOpenEditHouse={handleOpenEditHouse} handleTriggerDeleteHouse={handleTriggerDeleteHouse}
          roomHouseFilter={roomHouseFilter} allRoomsList={allRoomsList} houses={houses}
          roomSearch={roomSearch} setRoomSearch={setRoomSearch}
          handleOpenCreateRoom={handleOpenCreateRoom} filteredRooms={filteredRooms}
          handleToggleRoomAvailability={handleToggleRoomAvailability}
          handleOpenEditRoom={handleOpenEditRoom} handleTriggerDeleteRoom={handleTriggerDeleteRoom}
        />
      )}

      {/* ========================================================================= */}
      {/* SECCIÓN 3: HISTORIAS Y GUÍAS                                              */}
      {/* ========================================================================= */}
      {(dashActiveTab === 'historias' || dashActiveTab === 'stories') && (
        <StoriesTab
          tHis={tHis} tGen={tGen}
          storySearch={storySearch} setStorySearch={setStorySearch}
          handleOpenCreateStory={handleOpenCreateStory} filteredStories={filteredStories}
          handleNavigate={handleNavigate} handleOpenEditStory={handleOpenEditStory}
          handleTriggerDeleteStory={handleTriggerDeleteStory}
        />
      )}

      {/* ========================================================================= */}
      {/* SECCIÓN 4: CONSULTAS & MENSAJES                                           */}
      {/* ========================================================================= */}
      {dashActiveTab === 'inquiries' && (
        <InquiriesTab
          inquiries={inquiries} activeInquiryId={activeInquiryId} setActiveInquiryId={setActiveInquiryId}
          toggleInquiryRead={toggleInquiryRead} activeInquiry={activeInquiry}
          replyText={replyText} setReplyText={setReplyText} handleSendReply={handleSendReply}
        />
      )}

      {/* ========================================================================= */}
      {/* SECCIÓN 5: PERFIL DE ANFITRIONA                                           */}
      {/* ========================================================================= */}
      {dashActiveTab === 'settings' && (
        <SettingsTab
          hostProfile={hostProfile} setHostProfile={setHostProfile}
          setHasUnsavedChanges={setHasUnsavedChanges} handleManualSave={handleManualSave}
        />
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
