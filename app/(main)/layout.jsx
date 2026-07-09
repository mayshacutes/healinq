"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import Sidebar from "@/components/Sidebar";

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex">
      {/* Hamburger — mobile only */}
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="fixed left-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#db2d8d] shadow-[0_4px_12px_rgba(0,0,0,0.16)] transition hover:bg-[#fff5fa] md:hidden"
        aria-label="Open menu"
      >
        <Icon icon="solar:hamburger-menu-bold" className="text-[24px]" />
      </button>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="ml-0 w-full min-h-screen bg-[#d4eefc] relative z-0 md:ml-[87px]">
        {children}
      </main>
    </div>
  );
}
