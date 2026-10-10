import React from 'react';
import { Home, Search, Plus, MapPin, Bed, ExternalLink, Edit3, Trash2, Filter, Eye } from 'lucide-react';
import { House, Room } from '../../../types';

interface PropertiesTabProps {
  tCas: any;
  tHab: any;
  tGen: any;
  houseSearch: string;
  setHouseSearch: (val: string) => void;
  handleOpenCreateHouse: () => void;
  filteredHouses: House[];
  roomsByHouse: Record<string, Room[]>;
  setRoomHouseFilter: (val: string) => void;
  setDashActiveTab: (val: string) => void;
  handleNavigate: (page: string, params?: { houseId?: string }) => void;
  handleOpenEditHouse: (house: House) => void;
  handleTriggerDeleteHouse: (house: House) => void;
  roomHouseFilter: string;
  allRoomsList: { room: Room; house: House }[];
  houses: House[];
  roomSearch: string;
  setRoomSearch: (val: string) => void;
  handleOpenCreateRoom: (preSelectedHouseId?: string) => void;
  filteredRooms: { room: Room; house: House }[];
  handleToggleRoomAvailability: (houseId: string, roomId: string) => void;
  handleOpenEditRoom: (room: Room, houseId: string) => void;
  handleTriggerDeleteRoom: (room: Room, houseId: string) => void;
}

export function PropertiesTab({
  tCas, tHab, tGen,
  houseSearch, setHouseSearch, handleOpenCreateHouse, filteredHouses,
  roomsByHouse, setRoomHouseFilter, setDashActiveTab, handleNavigate,
  handleOpenEditHouse, handleTriggerDeleteHouse,
  roomHouseFilter, allRoomsList, houses, roomSearch, setRoomSearch,
  handleOpenCreateRoom, filteredRooms, handleToggleRoomAvailability,
  handleOpenEditRoom, handleTriggerDeleteRoom
}: PropertiesTabProps) {
  return (
    <>
      <div className="space-y-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHouses.map((house) => {
            const houseRooms = roomsByHouse[house.id] || [];
            return (
              <div
                key={house.id}
                className="bg-white rounded-3xl overflow-hidden border border-[rgba(63,67,77,0.08)] shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
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

      <div className="space-y-6 mt-12 pt-12 border-t border-[rgba(63,67,77,0.08)]">
        <h3 className="font-display font-medium text-2xl text-[#3F434D] mb-4">Gestión de Habitaciones</h3>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map(({ room, house }) => (
            <div
              key={`${house.id}-${room.id}`}
              className="bg-white rounded-3xl overflow-hidden border border-[rgba(63,67,77,0.08)] shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
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
    </>
  );
}
