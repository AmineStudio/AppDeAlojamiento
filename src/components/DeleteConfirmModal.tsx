import React from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';
import textos from '../content/textos.json';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemDescription?: string;
  warningNote?: string;
  confirmText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  title,
  message,
  itemDescription,
  warningNote,
  confirmText,
  onConfirm,
  onCancel,
  isDeleting = false
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  const tGen = textos.general;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-[rgba(63,67,77,0.12)] shadow-2xl relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="absolute top-5 right-5 h-8 w-8 rounded-full flex items-center justify-center text-[#6E727C] hover:bg-[#F5EFE0] transition-colors"
          disabled={isDeleting}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
          <Trash2 className="h-6 w-6" />
        </div>

        <h3 className="font-display font-medium text-xl text-[#3F434D] mb-2">
          {title}
        </h3>

        <p className="text-xs text-[#6E727C] leading-relaxed mb-4">
          {message}
        </p>

        {itemDescription && (
          <div className="p-3 rounded-xl bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] mb-4 text-xs font-semibold text-[#3F434D] truncate">
            {itemDescription}
          </div>
        )}

        {warningNote && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs mb-6">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <span className="leading-snug">{warningNote}</span>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-3 px-5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#F5EFE0] text-[#6E727C] hover:text-[#3F434D] hover:bg-[#EAE2D0] transition-colors"
          >
            {tGen.cancelar}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-3 px-5 rounded-full text-xs font-semibold uppercase tracking-wider bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-white animate-ping"></span>
                {tGen.guardando}
              </span>
            ) : (
              confirmText || tGen.eliminar
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
