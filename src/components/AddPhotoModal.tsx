import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

interface AddPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (url: string) => void;
  title: string;
}

export function AddPhotoModal({ isOpen, onClose, onAdd, title }: AddPhotoModalProps) {
  const [url, setUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAdd(url.trim());
      setUrl('');
      onClose();
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        onAdd(compressedBase64);
        setUrl('');
        onClose();
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-filter backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#FBF7EC] border border-[rgba(63,67,77,0.1)] rounded-3xl p-6 relative shadow-2xl animate-scale-up">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 hover:bg-[rgba(0,0,0,0.05)] rounded-full flex items-center justify-center text-md text-[#6E727C]"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <h2 className="font-display font-light text-2xl text-[#3F434D]">
            {title}
          </h2>
          <p className="text-[#6E727C] mt-2 text-xs leading-relaxed">
            Upload from device or paste an image URL.
          </p>
        </div>

        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors mb-6
            ${isDragging ? 'border-[#3D7A95] bg-[#3D7A95]/10' : 'border-[rgba(63,67,77,0.2)] hover:border-[#3D7A95] hover:bg-white'}
          `}
        >
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*"
          />
          <Upload className={`h-8 w-8 mb-3 ${isDragging ? 'text-[#3D7A95]' : 'text-[#6E727C]'}`} />
          <span className="text-sm font-medium text-[#3F434D]">
            Click to upload or drag and drop
          </span>
          <span className="text-xs text-[#6E727C] mt-1">
            JPG, PNG, WebP
          </span>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-[rgba(63,67,77,0.1)] flex-grow"></div>
          <span className="text-xs text-[#6E727C] uppercase font-bold tracking-wider">OR</span>
          <div className="h-px bg-[rgba(63,67,77,0.1)] flex-grow"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-4 py-3 rounded-xl bg-white border border-[rgba(63,67,77,0.1)] text-[#3F434D] text-sm focus:outline-none focus:border-[#3D7A95] transition-colors"
            />
          </div>
          <button 
            type="submit"
            disabled={!url.trim()}
            className="w-full bg-[#3F434D] text-[#FBF7EC] py-3 rounded-full font-medium hover:bg-[#A7AB5E] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Photo from URL
          </button>
        </form>
      </div>
    </div>
  );
}
