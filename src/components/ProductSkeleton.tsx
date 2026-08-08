import React from 'react';

export function ProductSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
      {/* Image Skeleton */}
      <div className="relative aspect-[4/5] shimmer-bg animate-shimmer w-full"></div>
      
      {/* Content Skeleton */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Title */}
        <div className="h-4 shimmer-bg animate-shimmer rounded w-3/4 mb-2"></div>
        <div className="h-4 shimmer-bg animate-shimmer rounded w-1/2 mb-4"></div>
        
        {/* Price & Action */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <div className="h-5 shimmer-bg animate-shimmer rounded w-16"></div>
            <div className="h-3 shimmer-bg animate-shimmer rounded w-12"></div>
          </div>
          <div className="w-10 h-10 shimmer-bg animate-shimmer rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
