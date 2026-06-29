import React from "react";

export function MilaLogo({ className = "h-12 w-auto" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 300 150" 
      className={className} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Sun/Moon on Top */}
      <circle cx="150" cy="20" r="14" stroke="#4E5340" strokeWidth="4.5" fill="#E6BE7A" />
      <path d="M137 20 C 142 32, 158 32, 163 20" stroke="#4E5340" strokeWidth="1.5" fill="#D1A55C" />

      {/* Baseline */}
      <line x1="5" y1="140" x2="295" y2="140" stroke="#4E5340" strokeWidth="5" strokeLinecap="round" />

      {/* Central Island */}
      <path 
        d="M100 140 C100 110, 200 110, 200 140 Z" 
        fill="#B4C167" 
        stroke="#4E5340" 
        strokeWidth="5" 
        strokeLinejoin="round" 
      />
      {/* Inner highlight for island */}
      <path 
        d="M112 137 C115 120, 185 120, 188 137" 
        stroke="#D9E29C" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
      />

      {/* Palm Tree Trunk */}
      <path 
        d="M141 120 C146 80, 148 55, 148 55" 
        stroke="#4E5340" 
        strokeWidth="5" 
        strokeLinecap="round" 
      />
      <path 
        d="M159 120 C154 80, 152 55, 152 55" 
        stroke="#4E5340" 
        strokeWidth="5" 
        strokeLinecap="round" 
      />

      {/* Palm Leaves */}
      {/* Left side fanning leaves */}
      <path d="M148 55 C132 40, 115 48, 118 64" stroke="#4E5340" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M148 55 C130 28, 110 32, 114 44" stroke="#4E5340" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M148 55 C138 20, 122 20, 128 32" stroke="#4E5340" strokeWidth="4.5" strokeLinecap="round" />
      
      {/* Right side fanning leaves */}
      <path d="M152 55 C168 40, 185 48, 182 64" stroke="#4E5340" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M152 55 C170 28, 190 32, 186 44" stroke="#4E5340" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M152 55 C162 20, 178 20, 172 32" stroke="#4E5340" strokeWidth="4.5" strokeLinecap="round" />

      {/* Left Crashing Wave */}
      <path 
        d="M 5 140 
           C 15 140, 30 115, 30 95 
           C 30 70, 55 65, 75 75
           C 85 79, 80 100, 68 96
           C 54 91, 54 105, 56 115
           C 58 122, 75 125, 95 133
           C 102 136, 110 140, 115 140
           Z" 
        fill="#5BA6C4" 
        stroke="#4E5340" 
        strokeWidth="5" 
        strokeLinejoin="round" 
      />
      {/* Inner Highlight Left Wave */}
      <path 
        d="M 12 135 C 23 108, 42 85, 62 82 C 72 82, 68 92, 58 92 C 45 92, 45 110, 78 126" 
        stroke="white" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        opacity="0.8"
      />

      {/* Right Crashing Wave */}
      <path 
        d="M 295 140 
           C 285 140, 270 115, 270 95 
           C 270 70, 245 65, 225 75
           C 215 79, 220 100, 232 96
           C 246 91, 246 105, 244 115
           C 242 122, 225 125, 205 133
           C 198 136, 190 140, 185 140
           Z" 
        fill="#5BA6C4" 
        stroke="#4E5340" 
        strokeWidth="5" 
        strokeLinejoin="round" 
      />
      {/* Inner Highlight Right Wave */}
      <path 
        d="M 288 135 C 277 108, 258 85, 238 82 C 228 82, 232 92, 242 92 C 255 92, 255 110, 222 126" 
        stroke="white" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        opacity="0.8"
      />
    </svg>
  );
}
