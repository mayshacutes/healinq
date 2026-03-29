"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menu = [
    {
      name: "Home",
      href: "/",
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
      href: "/healing",
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

  return (
    <div className="fixed left-0 top-0 w-[120px] h-screen bg-pink-200 flex flex-col items-center py-6 gap-6">
      
      {/* PROFILE */}
      <div className="flex flex-col items-center gap-2 mb-4">
        <div className="w-[70px] h-[70px] rounded-full overflow-hidden">
                  <Image
                      src="/images/icon_profile.png"
                      alt="profile"
                      width={70}
                      height={70}
                  />
              </div>
      </div>

      {/* MENU */}
      {menu.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.name}
            href={item.href}
            className="flex flex-col items-center gap-1"
          >
            <Image
              src={isActive ? item.activeIcon : item.icon}
              alt={item.name}
              width={40}
              height={40}
            />

            <span
                className={`text-sm ${
                  isActive ? "font-semibold" : "text-white"
                     }`}
                 style={{ color: isActive ? "#AF628E" : "white" }}
                >
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}