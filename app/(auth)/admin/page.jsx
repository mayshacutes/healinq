"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const stats = [
    {
        title: "Total active users",
        value: "1,000",
        icon: "/images/icon_users.png",
    },
    {
        title: "Registered counselors",
        value: "10",
        icon: "/images/icon_counselor.png",
    },
    {
        title: "Consultations",
        value: "100",
        icon: "/images/icon_calendar.png",
    },
    {
        title: "Total chats",
        value: "9,000",
        icon: "/images/icon_chat.png",
    },
];

const newUsers = [
    {
        id: 1,
        name: "Alya Putri",
        address: "Jakarta, Indonesia",
        joined: "Mar 28, 2026",
    },
    {
        id: 2,
        name: "Nadhif Ramadhan",
        address: "Bandung, Indonesia",
        joined: "Mar 27, 2026",
    },
    {
        id: 3,
        name: "Citra Maharani",
        address: "Surabaya, Indonesia",
        joined: "Mar 26, 2026",
    },
    {
        id: 4,
        name: "Raka Pratama",
        address: "Yogyakarta, Indonesia",
        joined: "Mar 25, 2026",
    },
];

const topCounselors = [
    { id: 1, name: "Dr. Aulia", sessions: 128 },
    { id: 2, name: "Dr. Nabila", sessions: 114 },
    { id: 3, name: "Dr. Farhan", sessions: 102 },
    { id: 4, name: "Dr. Keisha", sessions: 96 },
];

const recentActivities = [
    "A new user registered successfully.",
    "A counseling session was booked this morning.",
    "One payment was completed successfully.",
    "A counselor profile was updated by admin.",
];

const growthBars = [38, 52, 45, 66, 58, 74, 62];

function formatTopDate(date) {
    return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}

export default function AdminDashboardPage() {
    const pathname = usePathname();
    const [currentDate, setCurrentDate] = useState(new Date());

    const isOverview = pathname === "/admin";
    const isUsers = pathname === "/admin/users";
    const isCounselors = pathname === "/admin/counselors";
    const isTransactions = pathname === "/admin/transactions";
    const isActivity = pathname === "/admin/activity";

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDate(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#d9edf8]">
            {/* background blur blobs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-24 top-[55%] h-80 w-80 rounded-full bg-[#53bab3b2] blur-[100px]" />
                <div className="absolute right-[8%] top-[-8rem] h-80 w-80 rounded-full bg-[#53bab3b2] blur-[100px]" />
                <div className="absolute left-[14%] top-[-7rem] h-72 w-72 rounded-full bg-[#ffe5f3cc] blur-[100px]" />
                <div className="absolute right-[20%] top-[16%] h-72 w-72 rounded-full bg-[#ffe5f3cc] blur-[100px]" />
                <div className="absolute bottom-[-9rem] left-[-2rem] h-80 w-80 rounded-full bg-[#ffe5f3cc] blur-[100px]" />
                <div className="absolute bottom-[-5rem] left-[26%] h-72 w-72 rounded-full bg-[#9ad9f8cc] blur-[100px]" />
                <div className="absolute left-[-6rem] top-[-3rem] h-72 w-72 rounded-full bg-[#9ad9f8cc] blur-[100px]" />
                <Image
                    src="/images/header.png"
                    alt="Header Decoration"
                    width={1600}
                    height={200}
                    className="absolute top-0 left-0 w-full object-cover opacity-80"
                />
            </div>

            <div className="relative z-10 flex">
                {/* Sidebar */}
                <aside className="fixed left-0 top-0 z-40 flex h-screen w-[160px] flex-col items-center bg-[#efc6dc] px-4 py-6 shadow-sm">
                    <Link
                        href="/profile"
                        className="mb-10 flex h-[64px] w-[64px] items-center justify-center rounded-full transition hover:scale-105"
                        title="Profile"
                    >
                        <Image
                            src="/images/icon_profile.png"
                            alt="Profile"
                            width={64}
                            height={64}
                            className="h-[64px] w-[64px] object-contain"
                        />
                    </Link>

                    <nav className="flex w-full flex-col items-center gap-4">
                        <Link
                            href="/admin"
                            className={`flex min-h-[52px] w-full items-center justify-center rounded-full px-4 text-center text-[16px] font-semibold transition ${isOverview
                                ? "bg-white text-[#db2d8d] shadow-[0_4px_10px_rgba(0,0,0,0.12)]"
                                : "text-white hover:bg-white/20"
                                }`}
                        >
                            Dashboard
                        </Link>

                        <Link
                            href="/admin/users"
                            className={`flex min-h-[52px] w-full items-center justify-center rounded-full px-4 text-center text-[16px] font-semibold transition ${isUsers
                                ? "bg-white text-[#db2d8d] shadow-[0_4px_10px_rgba(0,0,0,0.12)]"
                                : "text-white hover:bg-white/20"
                                }`}
                        >
                            Users
                        </Link>

                        <Link
                            href="/admin/counselors"
                            className={`flex min-h-[52px] w-full items-center justify-center rounded-full px-4 text-center text-[16px] font-semibold transition ${isCounselors
                                ? "bg-white text-[#db2d8d] shadow-[0_4px_10px_rgba(0,0,0,0.12)]"
                                : "text-white hover:bg-white/20"
                                }`}
                        >
                            Counselors
                        </Link>

                        <Link
                            href="/admin/transactions"
                            className={`flex min-h-[52px] w-full items-center justify-center rounded-full px-4 text-center text-[16px] font-semibold transition ${isTransactions
                                ? "bg-white text-[#db2d8d] shadow-[0_4px_10px_rgba(0,0,0,0.12)]"
                                : "text-white hover:bg-white/20"
                                }`}
                        >
                            Transactions
                        </Link>

                        <Link
                            href="/admin/activity"
                            className={`flex min-h-[52px] w-full items-center justify-center rounded-full px-4 text-center text-[16px] font-semibold transition ${isActivity
                                ? "bg-white text-[#db2d8d] shadow-[0_4px_10px_rgba(0,0,0,0.12)]"
                                : "text-white hover:bg-white/20"
                                }`}
                        >
                            Activity
                        </Link>
                    </nav>
                </aside>

                {/* Main Content */}
                <section className="ml-[160px] w-full px-6 pt-40 pb-6 sm:px-8 lg:px-12">
                    <div className="relative">

                        {/* heading row */}
                        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h1 className="text-[34px] font-bold leading-none text-[#e1268d] sm:text-[42px]">
                                    Dashboard Overview
                                </h1>
                                <p className="mt-2 text-[18px] text-[#f08bbf]">
                                    Welcome back! Here’s your overview today
                                </p>
                            </div>

                            <div className="w-fit rounded-full bg-white px-5 py-2 text-[15px] font-medium text-[#e85fa7] shadow-sm">
                                {formatTopDate(currentDate)}
                            </div>
                        </div>

                        {/* stats */}
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {stats.map((item) => (
                                <div
                                    key={item.title}
                                    className="rounded-[18px] bg-[#bde6e5]/85 px-5 py-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
                                >
                                    {/* ICON */}
                                    <Image
                                        src={item.icon}
                                        alt={item.title}
                                        width={36}
                                        height={36}
                                        className="mb-4 h-9 w-9 object-contain"
                                    />

                                    {/* VALUE */}
                                    <div className="text-[18px] font-semibold text-[#0c72a6] sm:text-[20px]">
                                        {item.value}
                                    </div>

                                    {/* LABEL */}
                                    <p className="mt-1 text-[14px] text-[#ea3f97]">{item.title}</p>
                                </div>
                            ))}
                        </div>

                        {/* user growth */}
                        <div className="mb-6 rounded-[20px] bg-[#e7daf0]/85 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                            <h2 className="text-[18px] font-bold text-[#1e1e1e]">User Growth</h2>

                            <div className="mt-2 flex items-center gap-4 text-[12px] text-[#3a3a3a]">
                                <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#e83f96]" />
                                    <span>New users</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#0c72a6]" />
                                    <span>Consultations</span>
                                </div>
                            </div>

                            <div className="mt-6 rounded-[16px] bg-white/25 p-5">
                                <div className="flex h-[220px] items-end justify-between gap-4">
                                    {[
                                        { day: "Mon", users: 45, consultations: 32 },
                                        { day: "Tue", users: 60, consultations: 40 },
                                        { day: "Wed", users: 52, consultations: 36 },
                                        { day: "Thu", users: 78, consultations: 55 },
                                        { day: "Fri", users: 70, consultations: 48 },
                                        { day: "Sat", users: 88, consultations: 60 },
                                        { day: "Sun", users: 74, consultations: 50 },
                                    ].map((item) => (
                                        <div
                                            key={item.day}
                                            className="flex flex-1 flex-col items-center justify-end"
                                        >
                                            <div className="flex h-[170px] items-end gap-2">
                                                <div
                                                    className="w-5 bg-[#e83f96] shadow-sm"
                                                    style={{ height: `${item.users}%` }}
                                                />
                                                <div
                                                    className="w-5 bg-[#0c72a6] shadow-sm"
                                                    style={{ height: `${item.consultations}%` }}
                                                />
                                            </div>
                                            <span className="mt-4 text-[11px] text-[#6f6f6f]">{item.day}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* new users */}
                        <div className="mb-6 rounded-[20px] bg-white/80 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                            <h2 className="text-[18px] font-bold text-[#1e1e1e]">New Users</h2>
                            <p className="mt-1 text-[12px] text-[#5c5c5c]">
                                New registered users in the last 7 days
                            </p>

                            <div className="mt-6 overflow-x-auto">
                                <table className="w-full min-w-[600px] border-collapse">
                                    <thead>
                                        <tr className="border-b border-[#ea3f97]">
                                            <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">
                                                Users
                                            </th>
                                            <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">
                                                Address
                                            </th>
                                            <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">
                                                Joined
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {newUsers.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="border-b border-[#f1f1f1] last:border-b-0"
                                            >
                                                <td className="px-4 py-4 text-[14px] text-[#262626]">
                                                    {user.name}
                                                </td>
                                                <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">
                                                    {user.address}
                                                </td>
                                                <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">
                                                    {user.joined}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* bottom cards */}
                        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                            <div className="rounded-[20px] bg-[#bde6e5]/85 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                                <h2 className="text-[18px] font-bold text-[#1e1e1e]">
                                    Top Counselors
                                </h2>

                                <div className="mt-5 space-y-4">
                                    {topCounselors.map((counselor, index) => (
                                        <div
                                            key={counselor.id}
                                            className="flex items-center justify-between rounded-[14px] bg-white/55 px-4 py-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#efb7d5] text-sm font-semibold text-white">
                                                    {index + 1}
                                                </div>
                                                <span className="text-[14px] font-medium text-[#242424]">
                                                    {counselor.name}
                                                </span>
                                            </div>
                                            <span className="text-[13px] text-[#0c72a6]">
                                                {counselor.sessions} sessions
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-[20px] bg-[#bde6e5]/85 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                                <h2 className="text-[18px] font-bold text-[#1e1e1e]">
                                    Recent Activity
                                </h2>

                                <div className="mt-5 space-y-4">
                                    {recentActivities.map((activity, index) => (
                                        <div
                                            key={index}
                                            className="rounded-[14px] bg-white/55 px-4 py-3 text-[14px] text-[#343434]"
                                        >
                                            {activity}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}