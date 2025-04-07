'use client';

import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { useState, useEffect, useRef } from 'react';
import { useIsLargeScreen } from '@/hooks/useIsLargeScreen';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const isLargeScreen = useIsLargeScreen();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSidebarOpen(false);
  }, [isLargeScreen]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Header au top avec z-50 */}
      <div className="z-50 relative">
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      </div>

      {/* Le reste du contenu */}
      <div className="flex-1 relative">
        {/* Sidebar & overlay sous le header */}
        {isSidebarOpen && (
          <div
            ref={overlayRef}
            className="fixed top-16 left-0 right-0 bottom-0 z-40 bg-black bg-opacity-30 backdrop-blur-sm"
            onClick={handleOverlayClick}
          >
            <div className="absolute top-0 left-0 h-full w-[22rem] bg-white shadow-lg z-50">
              <Sidebar />
            </div>
          </div>
        )}

        {/* Main */}
        <main
          className={`transition-all duration-300 p-6 ${
            isSidebarOpen ? 'pointer-events-none blur-sm select-none' : ''
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
