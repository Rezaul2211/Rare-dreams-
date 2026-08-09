import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  className?: string;
  containerClassName?: string;
}

export function LazyImage({ src, alt, className, containerClassName, ...props }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    if (imgRef.current?.complete && imgRef.current.naturalHeight !== 0) {
      setIsLoaded(true);
    }
  }, [src]);

  return (
    <div className={clsx("relative overflow-hidden bg-neutral-100/90 flex-shrink-0", containerClassName)}>
      {/* Luxury Soft Shimmer Backdrop for Loading State */}
      <div 
        className={clsx(
          "absolute inset-0 bg-gradient-to-r from-neutral-100 via-neutral-200/50 to-neutral-100 bg-[length:200%_100%] animate-pulse pointer-events-none transition-opacity duration-700 ease-out z-0",
          isLoaded || hasError ? "opacity-0 pointer-events-none" : "opacity-100"
        )} 
      />

      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={clsx(
          "w-full h-full object-cover relative z-10 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] transform-gpu",
          !isLoaded ? "opacity-0 scale-[1.04] filter blur-md" : "opacity-100 scale-100 filter blur-0",
          className
        )}
        {...props}
      />

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-neutral-400 text-xs pointer-events-none z-20 font-medium">
          Image unavailable
        </div>
      )}
    </div>
  );
}

