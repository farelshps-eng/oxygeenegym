import React from 'react';

interface GymLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  lightText?: boolean;
}

export const GymLogo: React.FC<GymLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  lightText = true,
}) => {
  const sizeMap = {
    sm: { box: 'w-8 h-8', textTitle: 'text-sm', textSub: 'text-[9px]' },
    md: { box: 'w-10 h-10', textTitle: 'text-lg', textSub: 'text-[10px]' },
    lg: { box: 'w-14 h-14', textTitle: 'text-2xl', textSub: 'text-xs' },
    xl: { box: 'w-20 h-20', textTitle: 'text-3xl', textSub: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Athletic Oxygen Gym Emblem Icon */}
      <div
        className={`relative ${currentSize.box} rounded-xl bg-gradient-to-br from-[#1a1a24] via-[#121218] to-[#0a0a0e] border border-red-500/40 p-1 flex items-center justify-center shadow-lg shadow-red-950/30 overflow-hidden group`}
      >
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-red-600/10 group-hover:bg-red-600/20 transition-colors pointer-events-none" />

        {/* Crisp Vector Graphic SVG of Oxygen Gym Athletic Emblem */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Heavy Hexagonal Shield */}
          <polygon
            points="50,4 92,26 92,74 50,96 8,74 8,26"
            stroke="url(#oxygen-red-grad)"
            strokeWidth="4"
            fill="#09090c"
          />

          {/* Barbell Silhouette Behind */}
          <rect x="18" y="47" width="64" height="6" rx="2" fill="#475569" opacity="0.6" />
          <rect x="22" y="38" width="6" height="24" rx="2" fill="#64748b" />
          <rect x="14" y="42" width="6" height="16" rx="1.5" fill="#475569" />
          <rect x="72" y="38" width="6" height="24" rx="2" fill="#64748b" />
          <rect x="80" y="42" width="6" height="16" rx="1.5" fill="#475569" />

          {/* Central Athletic Letter O with Fire / Oxygen Flare */}
          <circle cx="50" cy="50" r="23" stroke="#ef4444" strokeWidth="6" fill="none" />
          <circle cx="50" cy="50" r="14" fill="#09090c" stroke="#dc2626" strokeWidth="2" />

          {/* Athletic Flame / Energy Surge in Center */}
          <path
            d="M50 34 C44 42 41 46 44 54 C46 59 50 62 50 62 C50 62 54 59 56 54 C59 46 56 42 50 34 Z"
            fill="url(#flame-grad)"
          />

          {/* Metallic Highlights */}
          <path
            d="M50 38 C47 43 45 46 47 52 C48 55 50 57 50 57 C50 57 52 55 53 52 C55 46 53 43 50 38 Z"
            fill="#ffffff"
            opacity="0.8"
          />

          {/* Gradients Definition */}
          <defs>
            <linearGradient id="oxygen-red-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ff4d4d" />
              <stop offset="0.5" stopColor="#e11d48" />
              <stop offset="1" stopColor="#991b1b" />
            </linearGradient>
            <linearGradient id="flame-grad" x1="50" y1="34" x2="50" y2="62" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="0.3" stopColor="#ff6b6b" />
              <stop offset="0.7" stopColor="#ef4444" />
              <stop offset="1" stopColor="#b91c1c" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black font-heading tracking-wider uppercase ${currentSize.textTitle} ${
                lightText ? 'text-white' : 'text-neutral-900'
              }`}
            >
              OXYGEN<span className="text-red-600 font-extrabold ml-1">GYM</span>
            </span>
          </div>
          <span
            className={`font-semibold tracking-wider text-red-500/90 font-sans mt-0.5 ${currentSize.textSub}`}
          >
            أوكسجين جيم · طرابلس
          </span>
        </div>
      )}
    </div>
  );
};
