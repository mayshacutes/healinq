"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  const menu = [
    { name: "Dashboard", href: "/admin" },
    { name: "Users", href: "/admin/users" },
    { name: "Counselors", href: "/admin/counselors" },
    { name: "Transactions", href: "/admin/transactions" },
    { name: "Activity", href: "/admin/activity" },
    { name: "Content", href: "/admin/content" },
  ];

  const isActive = (href) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const isProfileActive = pathname === "/admin/profile";

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[160px] flex-col items-center bg-[#efc6dc] px-4 py-6 shadow-sm">
      <Link
        href="/admin/profile"
        className={`mb-10 flex h-[64px] w-[64px] items-center justify-center rounded-full transition hover:scale-105 ${
          isProfileActive ? "ring-4 ring-white/70" : ""
        }`}
        title="Admin Profile"
      >
        <Image
          src="/images/icon_profile.png"
          alt="Admin Profile"
          width={64}
          height={64}
          className="h-[64px] w-[64px] object-contain"
        />
      </Link>

      <nav className="flex w-full flex-col items-center gap-4">
        {menu.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex min-h-[52px] w-full items-center justify-center rounded-full px-4 text-center text-[16px] font-semibold transition ${
              isActive(item.href)
                ? "bg-white text-[#db2d8d] shadow-[0_4px_10px_rgba(0,0,0,0.12)]"
                : "text-white hover:bg-white/20"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}