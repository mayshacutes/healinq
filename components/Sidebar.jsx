"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  const menu = [
    {
      name: "Home",
      href: "/dashboard/user",
      icon: "/images/icon_home.png",
      activeIcon: "/images/icon_home_active.png",
    },
    {
      name: "Konsultasi",
      href: "/consultation",
      icon: "/images/icon_konsultasi.png",
      activeIcon: "/images/icon_konsultasi_active.png",
    },
    {
      name: "Self-Healing",
      href: "/journaling",
      icon: "/images/icon_selfhealing.png",
      activeIcon: "/images/icon_selfhealing_active.png",
    },
    {
      name: "FYP",
      href: "/fyp",
      icon: "/images/icon_fyp.png",
      activeIcon: "/images/icon_fyp_active.png",
    },
  ];

  const sidebarContent = (
    <>
      <Link
        href="/profile"
        className="mb-2 flex flex-col items-center gap-2"
        onClick={onClose}
      >
        <Image
          src="/images/icon_profile.png"
          alt="Profile"
          width={52}
          height={52}
          className="h-[52px] w-[52px] object-contain"
        />
      </Link>

      {menu.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onClose}
            className="flex flex-col items-center gap-[2px]"
          >
            <Image
              src={isActive ? item.activeIcon : item.icon}
              alt={item.name}
              width={25}
              height={25}
            />
            <span
              className={`text-[8px] ${isActive ? "font-semibold" : ""}`}
              style={{ color: isActive ? "#AF628E" : "white" }}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
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
        className={`fixed left-0 top-0 z-50 h-screen w-[87px] bg-pink-200 flex-col items-center py-4 gap-4 transition-transform duration-300 md:flex ${isOpen ? "flex translate-x-0" : "hidden -translate-x-full md:hidden"
          }`}
      >
        <button
          onClick={onClose}
          className="absolute -right-10 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-600 shadow md:hidden"
        >
          ✕
        </button>

        {sidebarContent}
      </aside>

      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[87px] bg-pink-200 flex-col items-center py-4 gap-4 md:flex">
        {sidebarContent}
      </aside>
    </>
  );
}
