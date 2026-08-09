import React from 'react';

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 w-full animate-pulse" style={{ animationDuration: '2s' }}>
      {/* Breadcrumbs */}
      <div className="h-4 bg-neutral-200/60 rounded-md w-48 mb-8" />

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        {/* Images */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="w-full bg-gradient-to-br from-neutral-100 via-neutral-200/50 to-neutral-100 relative aspect-[4/5] rounded-3xl mb-4" />
          <div className="flex space-x-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-20 h-24 bg-neutral-200/60 rounded-xl shrink-0" />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="w-full lg:w-1/2 flex flex-col pt-2">
          <div className="bg-white rounded-3xl shadow-2xs border border-neutral-100 p-6 mb-8 space-y-4">
            <div className="h-8 bg-neutral-200/80 rounded-xl w-3/4" />
            <div className="h-4 bg-neutral-200/50 rounded-md w-1/2" />
            <div className="h-8 bg-neutral-200/80 rounded-xl w-1/3" />
            
            <div className="h-24 bg-neutral-100/90 rounded-2xl border border-neutral-200/50" />
            
            <div className="space-y-2">
              <div className="h-4 bg-neutral-200/60 rounded w-1/4" />
              <div className="flex space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-16 h-10 bg-neutral-200/60 rounded-xl" />
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="h-4 bg-neutral-200/60 rounded w-1/4" />
              <div className="flex space-x-2">
                 {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-12 h-10 bg-neutral-200/60 rounded-xl" />
                ))}
              </div>
            </div>

            <div className="h-14 bg-neutral-200/80 rounded-2xl pt-2" />
          </div>
        </div>
      </div>
    </div>
  );
}

