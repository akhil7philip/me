"use client";

import { cn } from '@/lib/utils';

interface RecordPlayerProps {
  isPlaying: boolean;
  className?: string;
}

export function RecordPlayer({ isPlaying, className }: RecordPlayerProps) {
  return (
    <div className={cn("relative w-16 h-16", className)}>
      {/* Record Player Base */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Turntable Base */}
        <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 border-2 border-amber-950 shadow-lg">
          {/* Inner Circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3/4 h-3/4 rounded-full bg-gradient-to-br from-amber-950 to-amber-900 border border-amber-800">
              {/* Center Spindle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-amber-950 border border-amber-800 shadow-inner" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vinyl Record */}
      <div 
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-transform duration-300",
          isPlaying && "animate-spin"
        )}
        style={{ 
          animationDuration: '3s',
          animationTimingFunction: 'linear',
          animationPlayState: isPlaying ? 'running' : 'paused'
        }}
      >
        <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-gray-700 shadow-xl">
          {/* Record Grooves */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Outer Groove */}
            <div className="w-[90%] h-[90%] rounded-full border border-gray-600 opacity-30" />
            {/* Middle Groove */}
            <div className="w-[70%] h-[70%] rounded-full border border-gray-600 opacity-30" />
            {/* Inner Groove */}
            <div className="w-[50%] h-[50%] rounded-full border border-gray-600 opacity-30" />
          </div>
          
          {/* Center Label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1/3 h-1/3 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-300 shadow-inner">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-amber-950" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tonearm (when not playing, it's lifted) */}
      <div 
        className={cn(
          "absolute top-0 left-1/2 w-1 h-8 origin-top transition-all duration-500",
          isPlaying ? "opacity-0" : "opacity-100"
        )}
        style={{
          transform: isPlaying 
            ? 'translateX(-50%) rotate(0deg)' 
            : 'translateX(-50%) rotate(25deg)',
        }}
      >
        <div className="w-full h-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-full shadow-md" />
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gray-800 border border-gray-600" />
      </div>
    </div>
  );
}

