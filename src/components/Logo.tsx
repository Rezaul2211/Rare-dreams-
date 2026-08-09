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
    sm: 'w-8 h-8',
    md: 'w-10 h-10 sm:w-11 sm:h-11',
    lg: 'w-12 h-12 sm:w-14 sm:h-14',
  }[size];

  const titleSize = {
    sm: 'text-base font-black tracking-tight',
    md: 'text-lg sm:text-xl font-black tracking-tight',
    lg: 'text-2xl sm:text-3xl font-black tracking-tight',
  }[size];

  const subtitleSize = {
    sm: 'text-[8px] tracking-[0.2em]',
    md: 'text-[9px] sm:text-[10px] tracking-[0.24em]',
    lg: 'text-[10px] sm:text-[11px] tracking-[0.26em]',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none group ${className}`}>
      {/* Circular Round Emblem */}
      <div className={`relative shrink-0 rounded-full p-[2px] bg-gradient-to-tr from-blue-700 via-sky-400 to-indigo-600 shadow-xs transition-transform duration-300 group-hover:scale-105 ${circleSize}`}>
        <div className={`w-full h-full rounded-full overflow-hidden flex items-center justify-center p-0.5 border border-white/80 ${
          isDark ? 'bg-neutral-900' : 'bg-white'
        }`}>
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
          <span className={`font-serif uppercase transition-colors ${titleSize} ${
            isDark ? 'text-white' : 'text-neutral-950'
          }`}>
            RARE DREAMS
          </span>
          <span className={`font-bold uppercase mt-0.5 text-neutral-500 transition-colors ${subtitleSize}`}>
            LUXURY FASHION
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;

