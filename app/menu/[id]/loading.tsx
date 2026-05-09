import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="flex flex-col items-center gap-4">
        {/* Loading Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-gray-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-[#C8A97E] border-t-transparent animate-spin"></div>
        </div>
        
        {/* Loading Text */}
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-[#C8A97E] font-bold tracking-widest uppercase text-sm animate-pulse">
            Loading Menu Item
          </h2>
          <p className="text-gray-500 text-xs">Please wait while we prepare the details...</p>
        </div>
      </div>
    </div>
  );
}
