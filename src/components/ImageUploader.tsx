import React, { useState, useRef } from 'react';
import { UploadCloud, Link as LinkIcon, Trash2, Star, Plus, Check, AlertCircle } from 'lucide-react';
import textos from '../content/textos.json';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  single?: boolean;
  label?: string;
  helperText?: string;
}

/**
 * Optimizes an image file by scaling to max dimensions and compressing to JPEG
 * so it fits smoothly into cloud storage and loads quickly.
 */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 1280;
        const MAX_HEIGHT = 1280;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Compress to JPEG with 0.82 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(file);
  });
}

export function ImageUploader({
  images,
  onChange,
  single = false,
  label,
  helperText
}: ImageUploaderProps) {
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = textos.subidaFotos;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const newImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          setErrorMessage(t.errorFormato);
          continue;
        }
        const compressed = await compressImage(file);
        newImages.push(compressed);
        if (single) break;
      }

      if (newImages.length > 0) {
        if (single) {
          onChange([newImages[0]]);
        } else {
          onChange([...images, ...newImages]);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al procesar la imagen');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleAddUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    if (single) {
      onChange([trimmed]);
    } else {
      onChange([...images, trimmed]);
    }
    setUrlInput('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0 || single) return;
    const selected = images[index];
    const rest = images.filter((_, idx) => idx !== index);
    onChange([selected, ...rest]);
  };

  return (
    <div className="space-y-4">
      {/* Label and Helper Header */}
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold uppercase tracking-widest text-[#6E727C]">
          {label || t.tituloGaleria} ({images.length} {images.length === 1 ? 'foto' : 'fotos'})
        </label>
        <span className="text-[10px] text-[#A7AB5E] font-semibold">
          {helperText || t.primeraFotoPrincipal}
        </span>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2.5 ${
          isDragging
            ? 'border-[#3D7A95] bg-[#CFE4EC]/30 scale-[1.01]'
            : 'border-[rgba(63,67,77,0.2)] bg-[#FBF7EC] hover:bg-[#F5EFE0] hover:border-[#3D7A95]'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFiles(e.target.files)}
          accept="image/*"
          multiple={!single}
          className="hidden"
        />

        <div className="h-12 w-12 rounded-full bg-white text-[#3D7A95] shadow-sm flex items-center justify-center">
          <UploadCloud className="h-6 w-6" />
        </div>

        <div>
          <p className="text-xs font-semibold text-[#3F434D]">
            {isProcessing ? t.procesando : t.arrastraAqui}
          </p>
          <p className="text-[11px] text-[#6E727C] mt-0.5">
            {t.oSelecciona}
          </p>
        </div>
      </div>

      {/* Paste URL Input */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6E727C] mb-1.5 flex items-center gap-1.5">
          <LinkIcon className="h-3 w-3 text-[#3D7A95]" />
          {t.pegarEnlace}
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            placeholder={t.placeholderEnlace}
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
            className="flex-1 bg-[#FBF7EC] border border-[rgba(63,67,77,0.1)] py-2.5 px-3.5 rounded-xl text-xs outline-none focus:border-[#3D7A95]"
          />
          <button
            type="button"
            onClick={() => handleAddUrl()}
            disabled={!urlInput.trim()}
            className="py-2.5 px-5 bg-[#3D7A95] text-white text-xs font-semibold rounded-xl uppercase tracking-wider hover:bg-[#2F6177] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {t.botonAnadirEnlace}
          </button>
        </div>
      </div>

      {/* Photos Preview Gallery */}
      {images.length > 0 ? (
        <div className="pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-[rgba(63,67,77,0.12)] bg-gray-100 shadow-sm"
              >
                <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />

                {/* Primary Tag */}
                {idx === 0 && (
                  <span className="absolute top-2 left-2 bg-[#3D7A95] text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                    <Star className="h-2.5 w-2.5 fill-white" />
                    {t.fotoPrincipal}
                  </span>
                )}

                {/* Overlay actions on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  {!single && idx !== 0 && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(idx)}
                      className="p-1.5 rounded-full bg-white text-[#3D7A95] hover:bg-[#F5EFE0] transition-colors shadow"
                      title="Establecer como foto principal de portada"
                    >
                      <Star className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow"
                    title={t.eliminarFoto}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-dashed border-[rgba(63,67,77,0.15)] text-center text-xs text-[#6E727C] bg-white/50">
          {t.sinFotos}
        </div>
      )}
    </div>
  );
}
