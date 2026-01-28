'use client';

import { useState, useRef, useEffect } from 'react';

interface BottomSheetProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function BottomSheet({ children, defaultOpen = false }: BottomSheetProps) {
  const [isExpanded, setIsExpanded] = useState(defaultOpen);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const minHeight = 120; // Collapsed height
  const maxHeight = typeof window !== 'undefined' ? window.innerHeight * 0.85 : 600;

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const diff = startY - currentY;
    if (diff > 50) {
      setIsExpanded(true);
    } else if (diff < -50) {
      setIsExpanded(false);
    }

    setIsDragging(false);
    setStartY(0);
    setCurrentY(0);
  };

  useEffect(() => {
    const handleResize = () => {
      // Reset on resize
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      ref={sheetRef}
      className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-all duration-300 ease-out z-20 md:hidden"
      style={{
        height: isExpanded ? maxHeight : minHeight,
        transform: isDragging && currentY > startY
          ? `translateY(${Math.min(currentY - startY, 100)}px)`
          : 'translateY(0)',
      }}
    >
      {/* Drag handle */}
      <div
        className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
      </div>

      {/* Content */}
      <div
        className="overflow-y-auto px-4 pb-8"
        style={{ height: `calc(100% - 40px)` }}
      >
        {children}
      </div>
    </div>
  );
}
