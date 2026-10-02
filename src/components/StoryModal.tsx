import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { BlogPost } from '../types';
import { ImageUploader } from './ImageUploader';
import textos from '../content/textos.json';

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (story: BlogPost, isEdit: boolean) => void;
  initialStory?: BlogPost | null;
}

export function StoryModal({ isOpen, onClose, onSave, initialStory }: StoryModalProps) {
  const isEdit = Boolean(initialStory);
  const t = textos.historias;
  const tGen = textos.general;

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState(t.categorias[0]);
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('Mila');
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialStory) {
      setTitle(initialStory.title);
      setSubtitle(initialStory.subtitle || '');
      setCategory(initialStory.category || t.categorias[0]);
      setExcerpt(initialStory.excerpt || '');
      setContent(initialStory.content || '');
      setAuthor(initialStory.author || 'Mila');
      setImages(initialStory.image ? [initialStory.image] : []);
    } else {
      setTitle('');
      setSubtitle('');
      setCategory(t.categorias[0]);
      setExcerpt('');
      setContent('');
      setAuthor('Mila');
      setImages([]);
    }
    setError(null);
  }, [initialStory, isOpen]);

  if (!isOpen) return null;

  const calculateReadTime = (text: string) => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 180));
    return `${minutes} min`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Por favor escribe un título para la historia.');
      return;
    }
    if (!content.trim()) {
      setError('Por favor redacta el contenido de la historia.');
      return;
    }
    if (images.length === 0) {
      setError('Por favor añade una foto de portada para este artículo.');
      return;
    }

    const storyId = initialStory
      ? initialStory.id
      : 'story-' +
        title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '') +
        '-' +
        Date.now().toString().slice(-4);

    const calculatedExcerpt = excerpt.trim() || content.trim().substring(0, 160) + '...';

    const storyData: BlogPost = {
      id: storyId,
      category: category.trim(),
      title: title.trim(),
      subtitle: subtitle.trim() || calculatedExcerpt,
      excerpt: calculatedExcerpt,
      content: content.trim(),
      author: author.trim() || 'Mila',
      readTime: initialStory?.readTime || calculateReadTime(content),
      publishedDate:
        initialStory?.publishedDate ||
        new Date().toLocaleDateString('es-ES', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }),
      image: images[0]
    };

    onSave(storyData, isEdit);
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
              {isEdit ? `Editar "${initialStory?.title}"` : t.modalCrear}
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

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">
                {t.campoTitulo} *
              </label>
              <input
                type="text"
                placeholder={t.placeholderTitulo}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.1)] py-3 px-4 rounded-xl text-xs font-medium outline-none focus:border-[#3D7A95] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">
                {t.campoCategoria} *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.1)] py-3 px-4 rounded-xl text-xs font-medium outline-none focus:border-[#3D7A95] transition-colors"
              >
                {t.categorias.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subtitle & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">
                {t.campoSubtitulo}
              </label>
              <input
                type="text"
                placeholder={t.placeholderSubtitulo}
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.1)] py-2.5 px-4 rounded-xl text-xs font-normal outline-none focus:border-[#3D7A95]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">
                {t.campoAutora}
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.1)] py-2.5 px-4 rounded-xl text-xs font-medium text-[#3F434D] outline-none"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">
              {t.campoResumen}
            </label>
            <input
              type="text"
              placeholder={t.placeholderResumen}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.1)] py-2.5 px-4 rounded-xl text-xs font-normal outline-none focus:border-[#3D7A95]"
            />
          </div>

          {/* Content Body */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#6E727C]">
                {t.campoContenido} *
              </label>
              <span className="text-[10px] font-medium text-[#3D7A95]">
                {calculateReadTime(content)} ({content.split(/\s+/).filter(Boolean).length} palabras)
              </span>
            </div>
            <textarea
              rows={8}
              placeholder={t.placeholderContenido}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.1)] py-3 px-4 rounded-xl text-xs font-normal outline-none focus:border-[#3D7A95] transition-colors resize-vertical leading-relaxed"
              required
            />
          </div>

          {/* Photo Uploader (Single Cover Image, Drag & Drop or Link, zero presets) */}
          <div className="p-4 rounded-2xl bg-[#FBF7EC]/60 border border-[rgba(63,67,77,0.08)]">
            <ImageUploader
              images={images}
              onChange={setImages}
              single={true}
              label={t.campoFotoPortada}
              helperText="Sube o enlaza la imagen de cabecera"
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
              {isEdit ? tGen.guardarCambios : 'Publicar Historia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
