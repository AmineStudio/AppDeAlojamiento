import React, { useState, useEffect } from 'react';
import { X, Bed, Eye } from 'lucide-react';
import { Room, House } from '../types';
import { ImageUploader } from './ImageUploader';
import textos from '../content/textos.json';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (targetHouseId: string, room: Room, isEdit: boolean, originalHouseId?: string) => void;
  houses: House[];
  defaultHouseId?: string;
  initialRoom?: Room | null;
  initialHouseId?: string;
}

export function RoomModal({
  isOpen,
  onClose,
  onSave,
  houses,
  defaultHouseId,
  initialRoom,
  initialHouseId
}: RoomModalProps) {
  const isEdit = Boolean(initialRoom);
  const t = textos.habitaciones;
  const tGen = textos.general;

  const [houseId, setHouseId] = useState<string>('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(75);
  const [available, setAvailable] = useState<boolean>(true);
  const [beds, setBeds] = useState(t.opcionesCamas[0]);
  const [view, setView] = useState(t.opcionesVistas[0]);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialRoom) {
      setHouseId(initialHouseId || defaultHouseId || (houses[0]?.id ?? ''));
      setName(initialRoom.name);
      setDescription(initialRoom.description);
      setPrice(initialRoom.price || 75);
      setAvailable(initialRoom.available !== undefined ? initialRoom.available : true);
      setBeds(initialRoom.beds || t.opcionesCamas[0]);
      setView(initialRoom.view || t.opcionesVistas[0]);
      setImages(initialRoom.images || []);
    } else {
      setHouseId(defaultHouseId || (houses[0]?.id ?? ''));
      setName('');
      setDescription('');
      setPrice(75);
      setAvailable(true);
      setBeds(t.opcionesCamas[0]);
      setView(t.opcionesVistas[0]);
      setImages([]);
    }
    setError(null);
  }, [initialRoom, initialHouseId, defaultHouseId, houses, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!houseId) {
      setError('Por favor selecciona el alojamiento al que pertenece esta habitación.');
      return;
    }
    if (!name.trim()) {
      setError('Por favor indica el nombre de la habitación.');
      return;
    }
    if (!description.trim()) {
      setError('Por favor indica una descripción.');
      return;
    }
    if (images.length === 0) {
      setError('Por favor sube o añade al menos una foto para esta habitación.');
      return;
    }

    const roomId = initialRoom
      ? initialRoom.id
      : 'rm-' +
        name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '') +
        '-' +
        Date.now().toString().slice(-4);

    const roomData: Room = {
      id: roomId,
      name: name.trim(),
      description: description.trim(),
      price: Number(price) || 60,
      available,
      beds: beds.trim() || t.opcionesCamas[0],
      view: view.trim() || t.opcionesVistas[0],
      images
    };

    onSave(houseId, roomData, isEdit, initialHouseId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl border border-[rgba(63,67,77,0.12)] shadow-2xl relative my-8 overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgba(63,67,77,0.08)] bg-[#FBF7EC]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#3D7A95] block mb-1">
              {isEdit ? t.modalEditar : t.modalCrear}
            </span>
            <h2 className="font-display font-medium text-2xl text-[#3F434D]">
              {isEdit ? `Editar ${initialRoom?.name}` : t.modalCrear}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="h-9 w-9 rounded-full flex items-center justify-center text-[#6E727C] hover:bg-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* House Selector */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">
              {t.campoAlojamiento} *
            </label>
            <select
              value={houseId}
              onChange={(e) => setHouseId(e.target.value)}
              className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.1)] py-3 px-4 rounded-xl text-xs font-semibold text-[#3F434D] outline-none focus:border-[#3D7A95] transition-colors"
              required
            >
              {houses.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.location})
                </option>
              ))}
            </select>
          </div>

          {/* Room Name & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">
                {t.campoNombre} *
              </label>
              <input
                type="text"
                placeholder={t.placeholderNombre}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.1)] py-3 px-4 rounded-xl text-xs font-medium outline-none focus:border-[#3D7A95] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">
                {t.campoPrecio} *
              </label>
              <div className="flex items-center gap-1.5 bg-[#FBF7EC] border border-[rgba(63,67,77,0.1)] rounded-xl px-3 py-2">
                <span className="text-xs font-bold text-[#6E727C]">€</span>
                <input
                  type="number"
                  min="15"
                  max="900"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-transparent text-xs font-bold text-[#3F434D] outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Beds, View & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#FBF7EC] border border-[rgba(63,67,77,0.06)]">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5 flex items-center gap-1">
                <Bed className="h-3 w-3 text-[#3D7A95]" /> {t.campoCamas}
              </label>
              <input
                type="text"
                list="preset-beds"
                placeholder={t.placeholderCamas}
                value={beds}
                onChange={(e) => setBeds(e.target.value)}
                className="w-full bg-white border border-[rgba(63,67,77,0.1)] py-2 px-3 rounded-xl text-xs font-medium text-[#3F434D] outline-none"
                required
              />
              <datalist id="preset-beds">
                {t.opcionesCamas.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5 flex items-center gap-1">
                <Eye className="h-3 w-3 text-[#A7AB5E]" /> {t.campoVistas}
              </label>
              <input
                type="text"
                list="preset-views"
                placeholder={t.placeholderVistas}
                value={view}
                onChange={(e) => setView(e.target.value)}
                className="w-full bg-white border border-[rgba(63,67,77,0.1)] py-2 px-3 rounded-xl text-xs font-medium text-[#3F434D] outline-none"
                required
              />
              <datalist id="preset-views">
                {t.opcionesVistas.map((v) => (
                  <option key={v} value={v} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">
                {t.campoEstado}
              </label>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setAvailable(!available)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    available ? 'bg-emerald-500' : 'bg-[#6E727C]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      available ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${available ? 'text-emerald-700' : 'text-[#6E727C]'}`}>
                  {available ? t.estadoDisponible : t.estadoOcupada}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">
              {t.campoDescripcion} *
            </label>
            <textarea
              rows={3}
              placeholder={t.placeholderDescripcion}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.1)] py-3 px-4 rounded-xl text-xs font-normal outline-none focus:border-[#3D7A95] transition-colors resize-vertical"
              required
            />
          </div>

          {/* Photo Uploader (Drag & Drop or Link, zero presets) */}
          <div className="p-4 rounded-2xl bg-[#FBF7EC]/60 border border-[rgba(63,67,77,0.08)]">
            <ImageUploader
              images={images}
              onChange={setImages}
              label={textos.subidaFotos.tituloGaleria}
              helperText={textos.subidaFotos.primeraFotoPrincipal}
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-[rgba(63,67,77,0.08)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-6 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#F5EFE0] text-[#6E727C] hover:text-[#3F434D] transition-colors"
            >
              {tGen.cancelar}
            </button>
            <button
              type="submit"
              className="py-2.5 px-7 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#A7AB5E] text-white hover:bg-[#888B47] shadow-md hover:shadow-lg transition-all"
            >
              {isEdit ? tGen.guardarCambios : tGen.crear}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
