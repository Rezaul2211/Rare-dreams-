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
    <div className={clsx("relative overflow-hidden bg-neutral-100 flex-shrink-0", containerClassName)}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={clsx(
          "w-full h-full object-cover transition-all duration-700 ease-out",
          !isLoaded ? "opacity-0 scale-105 blur-xl" : "opacity-100 scale-100 blur-0",
          className
        )}
        {...props}
      />
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-neutral-200/50 animate-pulse pointer-events-none" />
      )}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-neutral-400 text-xs pointer-events-none">
          Image not available
        </div>
      )}
    </div>
  );
}
