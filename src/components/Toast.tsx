import React from 'react';

interface ToastProps {
  toastMessage: string | null;
}

export function Toast({ toastMessage }: ToastProps) {
  if (!toastMessage) return null;
  return (
    <div className="fixed top-24 right-6 z-[60] flex items-center gap-3 bg-[#3F434D] text-[#FBF7EC] py-3 px-5 rounded-2xl shadow-xl animate-fade-in border border-[rgba(255,255,255,0.1)] max-w-sm transition-all duration-300">
      <div className="h-6 w-6 rounded-full bg-[#A7AB5E] text-white flex items-center justify-center font-bold text-sm">✓</div>
      <span className="text-sm font-medium">{toastMessage}</span>
    </div>
  );
}
