"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Sidebar() {
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

  return (
    <div className="fixed left-0 top-0 w-[87px] h-screen bg-pink-200 flex flex-col items-center py-4 gap-4">
      
          {/* PROFILE */}
          <Link href="/profile" className="flex flex-col items-center gap-2 mb-2">
              <div className="w-[52px] h-[52px] rounded-full overflow-hidden">
                  <Image
                      src="/images/icon_profile.png"
                      alt="profile"
                      width={52}
                      height={52}
                  />
              </div>
          </Link>

      {/* MENU */}
      {menu.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.name}
            href={item.href}
            className="flex flex-col items-center gap-[2px]"
          >
            <Image
              src={isActive ? item.activeIcon : item.icon}
              alt={item.name}
              width={25}
              height={25}
            />

            <span
              className={`text-[8px] ${
                isActive ? "font-semibold" : ""
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