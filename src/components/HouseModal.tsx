import React, { useState, useEffect } from 'react';
import { X, MapPin, Check } from 'lucide-react';
import { House } from '../types';
import { ImageUploader } from './ImageUploader';
import textos from '../content/textos.json';

interface HouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (house: House, isEdit: boolean) => void;
  initialHouse?: House | null;
}

export function HouseModal({ isOpen, onClose, onSave, initialHouse }: HouseModalProps) {
  const isEdit = Boolean(initialHouse);
  const t = textos.casas;
  const tGen = textos.general;

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerNight, setPricePerNight] = useState<number>(90);
  const [guests, setGuests] = useState<number>(6);
  const [beds, setBeds] = useState('3 Habitaciones · 6 Camas');
  const [tag, setTag] = useState(t.etiquetasPredefinidas[0]);
  const [features, setFeatures] = useState<string[]>([]);
  const [customFeature, setCustomFeature] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialHouse) {
      setName(initialHouse.name);
      setLocation(initialHouse.location);
      setDescription(initialHouse.description);
      setPricePerNight(initialHouse.pricePerNight || 90);
      setGuests(initialHouse.guests || 6);
      setBeds(initialHouse.beds || '3 Habitaciones');
      setTag(initialHouse.tag || t.etiquetasPredefinidas[0]);
      setFeatures(initialHouse.features || []);
      setImages(initialHouse.images || []);
    } else {
      setName('');
      setLocation('Las Palmas de Gran Canaria');
      setDescription('');
      setPricePerNight(95);
      setGuests(6);
      setBeds('3 Habitaciones · 6 Camas');
      setTag(t.etiquetasPredefinidas[0]);
      setFeatures(t.comodidadesSugeridas.slice(0, 3));
      setImages([]);
    }
    setError(null);
  }, [initialHouse, isOpen]);

  if (!isOpen) return null;

  const toggleFeature = (feat: string) => {
    if (features.includes(feat)) {
      setFeatures(features.filter(f => f !== feat));
    } else {
      setFeatures([...features, feat]);
    }
  };

  const handleAddCustomFeature = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customFeature.trim();
    if (trimmed && !features.includes(trimmed)) {
      setFeatures([...features, trimmed]);
      setCustomFeature('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor indica el nombre del alojamiento.');
      return;
    }
    if (!location.trim()) {
      setError('Por favor indica la ubicación.');
      return;
    }
    if (!description.trim()) {
      setError('Por favor escribe una descripción.');
      return;
    }
    if (images.length === 0) {
      setError('Por favor añade al menos una foto para este alojamiento (arrastrándola o pegando el enlace).');
      return;
    }

    const houseId = initialHouse
      ? initialHouse.id
      : name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

    const houseData: House = {
      id: houseId,
      name: name.trim(),
      location: location.trim(),
      description: description.trim(),
      pricePerNight: Number(pricePerNight) || 80,
      rating: initialHouse?.rating || 5.0,
      reviewCount: initialHouse?.reviewCount || 0,
      beds: beds.trim() || '3 Habitaciones',
      guests: Number(guests) || 4,
      tag: tag.trim(),
      tagClass: 'coral',
      images,
      features: features.length > 0 ? features : ['Wifi de alta velocidad']
    };

    onSave(houseData, isEdit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="w-full max-w-3xl bg-white rounded-3xl border border-[rgba(63,67,77,0.12)] shadow-2xl relative my-8 overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgba(63,67,77,0.08)] bg-[#FBF7EC]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#3D7A95] block mb-1">
              {isEdit ? t.modalEditar : t.modalCrear}
            </span>
            <h2 className="font-display font-medium text-2xl text-[#3F434D]">
              {isEdit ? `Editar ${initialHouse?.name}` : t.modalCrear}
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

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                {t.campoUbicacion} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={t.placeholderUbicacion}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.1)] py-3 pl-9 pr-4 rounded-xl text-xs font-medium outline-none focus:border-[#3D7A95] transition-colors"
                  required
                />
                <MapPin className="h-4 w-4 absolute left-3 top-3 text-[#6E727C]" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">
                {t.campoEtiqueta}
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.1)] py-3 px-4 rounded-xl text-xs font-medium outline-none focus:border-[#3D7A95] transition-colors"
              >
                {t.etiquetasPredefinidas.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#FBF7EC] border border-[rgba(63,67,77,0.06)]">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">
                {t.campoPrecio}
              </label>
              <div className="flex items-center gap-1.5 bg-white border border-[rgba(63,67,77,0.1)] rounded-xl px-3 py-2">
                <span className="text-xs font-bold text-[#6E727C]">€</span>
                <input
                  type="number"
                  min="20"
                  max="1500"
                  value={pricePerNight}
                  onChange={(e) => setPricePerNight(Number(e.target.value))}
                  className="w-full bg-transparent text-xs font-bold text-[#3F434D] outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">
                {t.campoCapacidad}
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full bg-white border border-[rgba(63,67,77,0.1)] py-2 px-3 rounded-xl text-xs font-bold text-[#3F434D] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">
                {t.campoHabitacionesResumen}
              </label>
              <input
                type="text"
                placeholder={t.placeholderHabitacionesResumen}
                value={beds}
                onChange={(e) => setBeds(e.target.value)}
                className="w-full bg-white border border-[rgba(63,67,77,0.1)] py-2 px-3 rounded-xl text-xs font-medium text-[#3F434D] outline-none"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">
              {t.campoDescripcion} *
            </label>
            <textarea
              rows={4}
              placeholder={t.placeholderDescripcion}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.1)] py-3 px-4 rounded-xl text-xs font-normal outline-none focus:border-[#3D7A95] transition-colors resize-vertical"
              required
            />
          </div>

          {/* Amenities & Features */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-2">
              {t.campoComodidades} ({features.length} seleccionadas)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {t.comodidadesSugeridas.map((amenity) => {
                const isSelected = features.includes(amenity);
                return (
                  <button
                    type="button"
                    key={amenity}
                    onClick={() => toggleFeature(amenity)}
                    className={`py-1.5 px-3 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#3D7A95] text-white shadow-sm'
                        : 'bg-[#F5EFE0] text-[#6E727C] hover:text-[#3F434D]'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                    {amenity}
                  </button>
                );
              })}
            </div>

            {/* Custom feature input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t.placeholderComodidad}
                value={customFeature}
                onChange={(e) => setCustomFeature(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomFeature(e))}
                className="flex-1 bg-[#FBF7EC] border border-[rgba(63,67,77,0.1)] py-2 px-3 rounded-xl text-xs outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomFeature}
                className="py-2 px-4 bg-[#F5EFE0] hover:bg-[#EAE2D0] text-[#3F434D] text-xs font-semibold rounded-xl uppercase tracking-wider transition-colors"
              >
                + Añadir
              </button>
            </div>
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
