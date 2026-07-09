"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import CounselorSidebar from "@/components/CounselorSidebar";

export default function CounselorLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#d9edf8]">
      {/* Hamburger — mobile only */}
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="fixed left-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#db2d8d] shadow-[0_4px_12px_rgba(0,0,0,0.16)] transition hover:bg-[#fff5fa] md:hidden"
        aria-label="Open menu"
      >
        <Icon icon="solar:hamburger-menu-bold" className="text-[24px]" />
      </button>

      <div className="relative z-10 flex">
        <CounselorSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <section className="ml-0 w-full md:ml-[160px]">
          {children}
        </section>
      </div>
    </div>
  );
}
