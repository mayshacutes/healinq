"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex">
      {/* Hamburger — mobile only */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed left-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow md:hidden"
        aria-label="Open menu"
      >
        <span className="block h-0.5 w-4 bg-gray-700 rounded" />
        <span className="block h-0.5 w-4 bg-gray-700 rounded mt-1" />
        <span className="block h-0.5 w-4 bg-gray-700 rounded mt-1" />
      </button>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="ml-0 w-full min-h-screen bg-[#d4eefc] relative z-0 md:ml-[87px]">
        {children}
      </main>
    </div>
  );
}
