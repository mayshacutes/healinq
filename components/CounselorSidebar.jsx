"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";

export default function CounselorSidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  const menu = [
    { name: "Profile", href: "/counselors/profile" },
    { name: "Schedule", href: "/counselors/schedule" },
    { name: "Chat", href: "/counselors/chat" },
    { name: "Transaction", href: "/counselors/transaction" },
  ];

  const isActive = (href) => {
    return pathname.startsWith(href);
  };

  const isProfileActive = pathname === "/counselors/profile";

  const sidebarContent = (
    <>
      <Link
        href="/counselors/profile"
        onClick={onClose}
        className={`mb-10 flex h-[64px] w-[64px] items-center justify-center rounded-full transition hover:scale-105 ${isProfileActive ? "ring-4 ring-white/70" : ""
          }`}
        title="Counselor Profile"
      >
        <Image
          src="/images/icon_profile.png"
          alt="HealinQ"
          width={64}
          height={64}
          className="h-[64px] w-[64px] rounded-full object-cover"
        />
      </Link>

      <nav className="flex w-full flex-col items-center gap-4">
        {menu.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={onClose}
            className={`flex min-h-[52px] w-full items-center justify-center rounded-full px-4 text-center text-[16px] font-semibold transition ${isActive(item.href)
                ? "bg-white text-[#db2d8d] shadow-[0_4px_10px_rgba(0,0,0,0.12)]"
                : "text-white hover:bg-white/20"
              }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </>
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-[160px] flex-col items-center bg-[#efc6dc] px-4 py-6 shadow-sm transition-transform duration-300 md:flex ${isOpen ? "flex translate-x-0" : "hidden -translate-x-full md:hidden"
          }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -right-10 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#db2d8d] shadow transition hover:bg-[#fff5fa] md:hidden"
          aria-label="Close menu"
        >
          <Icon icon="solar:close-circle-bold" className="text-[22px]" />
        </button>

        {sidebarContent}
      </aside>

      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[160px] flex-col items-center bg-[#efc6dc] px-4 py-6 shadow-sm md:flex">
        {sidebarContent}
      </aside>
    </>
  );
}
