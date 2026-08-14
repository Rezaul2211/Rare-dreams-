import React from 'react';
import logoImg from '../assets/images/raredreams_logo_1786300009548.jpg';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showEmblem?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'light',
  size = 'md',
  className = '',
  showEmblem = true
}) => {
  const isDark = variant === 'dark';

  const titleSize = {
    sm: 'text-base sm:text-lg font-bold tracking-tight',
    md: 'text-xl sm:text-2xl md:text-3xl font-bold tracking-tight',
    lg: 'text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight',
  }[size];

  const subtitleSize = {
    sm: 'text-[7.5px] sm:text-[8px] tracking-[0.22em] font-medium',
    md: 'text-[8px] sm:text-[9.5px] tracking-[0.26em] font-medium',
    lg: 'text-[9.5px] sm:text-[11px] tracking-[0.3em] font-medium',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2 sm:gap-2.5 select-none group ${className}`}>
      {showEmblem && (
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-2xs border border-neutral-100 shrink-0">
          <img
            src={logoImg}
            alt="Rare Dreams Logo"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      )}

      {/* Luxury Brand Typography */}
      <div className={`flex flex-col justify-center leading-none ${showEmblem ? 'items-center sm:items-start' : 'items-center text-center'}`}>
        <span 
          className={`font-serif italic transition-colors leading-tight ${titleSize} ${
            isDark ? 'text-white' : 'text-neutral-950'
          }`}
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Rare Dreams
        </span>
        <span className={`uppercase mt-0.5 tracking-widest text-neutral-500 transition-colors ${subtitleSize}`}>
          LUXURY FASHION
        </span>
      </div>
    </div>
  );
};

export default Logo;



