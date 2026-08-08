import React from 'react';

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 w-full">
      {/* Breadcrumbs */}
      <div className="h-4 shimmer-bg animate-shimmer rounded w-48 mb-8"></div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        {/* Images */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="w-full shimmer-bg animate-shimmer relative aspect-[4/5] rounded-3xl mb-4"></div>
          <div className="flex space-x-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-20 h-24 shimmer-bg animate-shimmer rounded-xl"></div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="w-full lg:w-1/2 flex flex-col pt-2">
          <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6 mb-8">
            <div className="h-8 shimmer-bg animate-shimmer rounded w-3/4 mb-4"></div>
            <div className="h-4 shimmer-bg animate-shimmer rounded w-1/2 mb-6"></div>
            <div className="h-8 shimmer-bg animate-shimmer rounded w-1/4 mb-8"></div>
            
            <div className="h-24 shimmer-bg animate-shimmer rounded-2xl mb-6"></div>
            
            <div className="h-6 shimmer-bg animate-shimmer rounded w-1/4 mb-2"></div>
            <div className="flex space-x-2 mb-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-10 h-10 shimmer-bg animate-shimmer rounded-full"></div>
              ))}
            </div>

            <div className="h-6 shimmer-bg animate-shimmer rounded w-1/4 mb-2"></div>
            <div className="flex space-x-2 mb-8">
               {[...Array(4)].map((_, i) => (
                <div key={i} className="w-12 h-10 shimmer-bg animate-shimmer rounded-xl"></div>
              ))}
            </div>

            <div className="h-14 shimmer-bg animate-shimmer rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
