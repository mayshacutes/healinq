"use client";

import { useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#d9edf8]">
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

      <div className="relative z-10 flex">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <section className="ml-0 w-full md:ml-[160px]">
          {children}
        </section>
      </div>
    </div>
  );
}
