import React from 'react';
import logoImg from '../assets/images/raredreams_logo_1786300009548.jpg';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'light',
  size = 'md',
  className = '',
  showText = true // Show text by default beside the round logo
}) => {
  const isDark = variant === 'dark';

  const circleSize = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12 sm:w-14 sm:h-14',
    lg: 'w-16 h-16 sm:w-20 sm:h-20',
  }[size];

  const titleSize = {
    sm: 'text-xl font-bold tracking-tight',
    md: 'text-2xl sm:text-3xl font-bold tracking-tight',
    lg: 'text-4xl sm:text-5xl font-bold tracking-tight',
  }[size];

  const subtitleSize = {
    sm: 'text-[9px] tracking-[0.2em] font-bold',
    md: 'text-[10px] sm:text-[11px] tracking-[0.24em] font-bold',
    lg: 'text-[11px] sm:text-[12px] tracking-[0.26em] font-bold',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none group ${className}`}>
      {/* Circular Round Emblem */}
      <div className={`relative shrink-0 rounded-full shadow-sm transition-transform duration-300 group-hover:scale-105 ${circleSize}`}>
        <div className={`w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-white`}>
          <img
            src={logoImg}
            alt="Rare Dreams Logo"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-full mix-blend-multiply contrast-125 transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      </div>

      {/* Prominent Website Name Text */}
      {showText && (
        <div className="flex flex-col text-left justify-center leading-none">
          <span 
            className={`italic transition-colors ${titleSize} ${
              isDark ? 'text-white' : 'text-neutral-950'
            }`}
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Rare Dreams
          </span>
          <span className={`uppercase mt-1 text-neutral-500 transition-colors ${subtitleSize}`}>
            LUXURY FASHION
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;

