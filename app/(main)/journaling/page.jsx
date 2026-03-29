"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const moodOptions = [
    { id: "awful", emoji: "😞", label: "Awful" },
    { id: "sad", emoji: "😟", label: "Sad" },
    { id: "okay", emoji: "😐", label: "Okay" },
    { id: "good", emoji: "🙂", label: "Good" },
    { id: "great", emoji: "😄", label: "Great" },
];

const jarMessages = [
    "You are allowed to grow slowly. Small progress is still progress.",
    "Take a deep breath. You do not have to solve everything today.",
    "Write down 3 things you survived before this moment.",
    "Drink a glass of water and stretch for 2 minutes.",
    "Rest is not laziness. Rest is part of healing.",
    "Today’s challenge: say one kind thing to yourself out loud.",
    "You are still worthy, even on low-energy days.",
    "Try naming one emotion you feel right now without judging it.",
    "It is okay to pause. You are not falling behind.",
    "One gentle step is enough for today.",
    "Your feelings are valid, even when they are hard to explain.",
    "Challenge: leave your screen for 5 minutes and breathe slowly.",
    "You do not need to be productive to deserve peace.",
    "Healing is not linear, and that is completely okay.",
    "You have made it through difficult days before.",
];

const ballColors = [
    "bg-[#f7a8d4]",
    "bg-[#8bd9d2]",
    "bg-[#9bd7f5]",
    "bg-[#f4b6d9]",
    "bg-[#7fd0c7]",
    "bg-[#a9ddf7]",
];

const dummyEntries = [
    {
        id: 1,
        title: "A calmer afternoon",
        content:
            "Today I finally slowed down a little. I sat by the window, listened to music, and felt more peaceful than yesterday.",
        createdAt: "2026-03-05T14:20:00",
    },
    {
        id: 2,
        title: "Little win",
        content:
            "I finished one small task that I had been avoiding. It was not huge, but it still felt good.",
        createdAt: "2026-03-05T09:10:00",
    },
    {
        id: 3,
        title: "",
        content:
            "I want to sleep earlier tonight and be kinder to myself tomorrow.",
        createdAt: "2026-03-04T20:30:00",
    },
    {
        id: 4,
        title: "Morning thoughts",
        content:
            "I felt anxious in the morning, but after breakfast and a short walk, things became a bit lighter.",
        createdAt: "2026-03-04T08:00:00",
    },
];

function formatTopDate(date) {
    return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}

function formatCardDate(dateString) {
    return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        day: "numeric",
        month: "short",
    }).format(new Date(dateString));
}

function getDateGroupLabel(dateString) {
    const entryDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const entryOnly = new Date(
        entryDate.getFullYear(),
        entryDate.getMonth(),
        entryDate.getDate()
    );
    const todayOnly = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );
    const yesterdayOnly = new Date(
        yesterday.getFullYear(),
        yesterday.getMonth(),
        yesterday.getDate()
    );

    if (entryOnly.getTime() === todayOnly.getTime()) return "Today";
    if (entryOnly.getTime() === yesterdayOnly.getTime()) return "Yesterday";

    return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
    }).format(entryDate);
}

export default function JournalingPage() {
    const pathname = usePathname();

    const isHome = pathname === "/dashboard/user";
    const isConsultation = pathname === "/consultation";
    const isJournaling = pathname === "/journaling";
    const isFyp = pathname === "/fyp";

    const [currentDate, setCurrentDate] = useState(new Date());
    const [entries, setEntries] = useState([]);
    const [selectedMood, setSelectedMood] = useState("");
    const [showEntryForm, setShowEntryForm] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [jarOpen, setJarOpen] = useState(false);
    const [jarMessage, setJarMessage] = useState("");
    const [jarColor, setJarColor] = useState(ballColors[0]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDate(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const storedCurrentUser = JSON.parse(localStorage.getItem("currentUser"));

        const fallbackUser = {
            username: "Bunny",
            email: "bunny@example.com",
            xp: 1240,
        };

        const activeUser = storedCurrentUser || fallbackUser;
        setCurrentUser(activeUser);

        const journalKey = `journalEntries_${activeUser.email}`;
        const moodKey = `moodToday_${activeUser.email}`;

        const savedEntries = JSON.parse(localStorage.getItem(journalKey));
        const savedMood = localStorage.getItem(moodKey);

        if (savedEntries && Array.isArray(savedEntries) && savedEntries.length > 0) {
            setEntries(savedEntries);
        } else {
            localStorage.setItem(journalKey, JSON.stringify(dummyEntries));
            setEntries(dummyEntries);
        }

        if (savedMood) {
            setSelectedMood(savedMood);
        }
    }, []);

    const groupedEntries = useMemo(() => {
        const groups = {};

        entries.forEach((entry) => {
            const label = getDateGroupLabel(entry.createdAt);
            if (!groups[label]) groups[label] = [];
            groups[label].push(entry);
        });

        return groups;
    }, [entries]);

    const handleMoodClick = (moodId) => {
        setSelectedMood(moodId);

        if (currentUser?.email) {
            localStorage.setItem(`moodToday_${currentUser.email}`, moodId);
        }
    };

    const handleSaveEntry = () => {
        if (!content.trim()) return;

        const newEntry = {
            id: Date.now(),
            title: title.trim(),
            content: content.trim(),
            createdAt: new Date().toISOString(),
        };

        const updatedEntries = [newEntry, ...entries];
        setEntries(updatedEntries);

        if (currentUser?.email) {
            localStorage.setItem(
                `journalEntries_${currentUser.email}`,
                JSON.stringify(updatedEntries)
            );
        }

        setTitle("");
        setContent("");
        setShowEntryForm(false);
    };

    const handleJarClick = () => {
        const randomMessage =
            jarMessages[Math.floor(Math.random() * jarMessages.length)];
        const randomColor =
            ballColors[Math.floor(Math.random() * ballColors.length)];

        setJarMessage(randomMessage);
        setJarColor(randomColor);
        setJarOpen(true);
    };

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
            </div>

            <div className="relative z-10 flex">
                <aside className="fixed left-0 top-0 z-40 flex h-screen w-[80px] flex-col items-center bg-[#efc6dc] px-2 py-5 shadow-sm">
                    <Link
                        href="/profile"
                        className="mb-7 flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-full transition hover:scale-105"
                        title="Profile"
                    >
                        <Image
                            src="/images/icon_profile.png"
                            alt="Profile"
                            width={60}
                            height={60}
                            className="h-[60px] w-[60px] object-contain"
                        />
                    </Link>

                    <nav className="flex flex-1 flex-col items-center gap-7">
                        <Link
                            href="/dashboard/user"
                            className={`flex flex-col items-center text-center text-[10px] transition hover:scale-105 ${isHome ? "font-medium text-[#db7bb2]" : "text-white/90"
                                }`}
                        >
                            <Image
                                src={isHome ? "/images/icon_home_active.png" : "/images/icon_home.png"}
                                alt="Home"
                                width={28}
                                height={28}
                                className="mb-1 h-7 w-7 object-contain"
                            />
                            <span>Home</span>
                        </Link>

                        <Link
                            href="/consultation"
                            className={`flex flex-col items-center text-center text-[10px] transition hover:scale-105 ${isConsultation ? "font-medium text-[#db7bb2]" : "text-white/90"
                                }`}
                        >
                            <Image
                                src={
                                    isConsultation
                                        ? "/images/icon_konsultasi_active.png"
                                        : "/images/icon_konsultasi.png"
                                }
                                alt="Consultation"
                                width={28}
                                height={28}
                                className="mb-1 h-7 w-7 object-contain"
                            />
                            <span>Consultation</span>
                        </Link>

                        <Link
                            href="/journaling"
                            className={`flex flex-col items-center text-center text-[10px] transition hover:scale-105 ${isJournaling ? "font-medium text-[#db7bb2]" : "text-white/90"
                                }`}
                        >
                            <Image
                                src={
                                    isJournaling
                                        ? "/images/icon_selfhealing_active.png"
                                        : "/images/icon_selfhealing.png"
                                }
                                alt="Self Healing"
                                width={28}
                                height={28}
                                className="mb-1 h-7 w-7 object-contain"
                            />
                            <span>Self-Healing</span>
                        </Link>

                        <Link
                            href="/fyp"
                            className={`flex flex-col items-center text-center text-[10px] transition hover:scale-105 ${isFyp ? "font-medium text-[#db7bb2]" : "text-white/90"
                                }`}
                        >
                            <Image
                                src={isFyp ? "/images/icon_fyp_active.png" : "/images/icon_fyp.png"}
                                alt="FYP"
                                width={28}
                                height={28}
                                className="mb-1 h-7 w-7 object-contain"
                            />
                            <span>FYP</span>
                        </Link>
                    </nav>
                </aside>

                <section className="ml-[80px] w-full px-5 py-6 sm:px-8 lg:px-10">
                    <div className="relative rounded-[28px] px-5 py-6 sm:px-7 lg:px-10">
                        <div className="pointer-events-none absolute inset-0 overflow-hidden">
                            <div className="absolute left-[-70px] top-[28%] h-52 w-52 rounded-full bg-[#8dd8d1]/30 blur-[80px]" />
                            <div className="absolute right-[8%] top-[70%] h-52 w-52 rounded-full bg-[#f6bfdc]/40 blur-[90px]" />
                            <div className="absolute right-[20%] top-[10%] h-44 w-44 rounded-full bg-[#9dd8f5]/35 blur-[80px]" />
                        </div>

                        <div className="relative z-10">
                            <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <h1 className="text-[34px] font-bold leading-none text-[#0c72a6] sm:text-[42px]">
                                        Daily Journaling
                                    </h1>
                                    <p className="mt-2 text-[18px] italic text-[#2086c4]">
                                        Where thoughts find their words
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">

                                    {/* XP BOX (BIRU) */}
                                    <div className="flex items-center gap-3 rounded-full bg-[#8fd0ef] px-4 py-2 shadow-[0_4px_10px_rgba(0,0,0,0.08)]">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-[#d9f1ff] text-[12px] font-semibold text-[#5a8ec1]">
                                            XP
                                        </div>

                                        <span className="text-[18px] font-bold text-white">
                                            {currentUser?.xp || 1240}
                                        </span>
                                    </div>

                                    {/* MASCOT + LOGO (PINK) */}
                                    <div className="flex items-center gap-2 rounded-full bg-[#efb7d5] px-4 py-2 shadow-[0_4px_10px_rgba(0,0,0,0.08)]">
                                        <Image
                                            src="/images/maskot1.png"
                                            alt="Mascot"
                                            width={38}
                                            height={38}
                                            className="h-9 w-9 object-contain"
                                        />
                                        <Image
                                            src="/images/logo.png"
                                            alt="HealinQ Logo"
                                            width={50}
                                            height={50}
                                            className="h-auto w-[50px] object-contain"
                                        />
                                    </div>

                                </div>
                            </div>

                            <div className="mb-12 rounded-[18px] bg-white/90 px-4 py-4 shadow-[0_4px_18px_rgba(0,0,0,0.08)] sm:px-5">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                                    <div className="text-[18px] font-medium text-[#272727]">
                                        Track Your Mood Today
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        {moodOptions.map((mood) => {
                                            const isActive = selectedMood === mood.id;

                                            return (
                                                <button
                                                    key={mood.id}
                                                    type="button"
                                                    onClick={() => handleMoodClick(mood.id)}
                                                    className={`flex h-11 w-11 items-center justify-center rounded-full border text-xl transition ${isActive
                                                            ? "scale-110 border-[#0c72a6] bg-[#d9edf8] shadow-md"
                                                            : "border-[#ececec] bg-[#f8f8f8] hover:scale-105"
                                                        }`}
                                                    title={mood.label}
                                                >
                                                    {mood.emoji}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="hidden h-9 w-px bg-[#d9d9d9] lg:block" />

                                    <p className="text-[16px] italic text-[#444]">
                                        {selectedMood
                                            ? `Today's mood saved: ${moodOptions.find((m) => m.id === selectedMood)?.label
                                            }`
                                            : "Tell me how do you feel today..."}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-8 flex items-center justify-between gap-3">
                                <h2 className="text-[30px] font-bold text-[#0c72a6]">
                                    Journaling Notes
                                </h2>

                                <button
                                    type="button"
                                    onClick={() => setShowEntryForm((prev) => !prev)}
                                    className="rounded-full bg-[#0c72a6] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#0a5f8a]"
                                >
                                    + New Entry
                                </button>
                            </div>

                            {showEntryForm && (
                                <div className="mb-8 rounded-[20px] bg-white/95 p-5 shadow-[0_4px_18px_rgba(0,0,0,0.08)]">
                                    <div className="flex flex-col gap-4">
                                        <input
                                            type="text"
                                            placeholder="Title (optional)"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="h-[46px] rounded-[14px] border border-[#d8d8d8] px-4 text-[14px] text-[#2c2c2c] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0c72a6]/20"
                                        />

                                        <textarea
                                            placeholder="Write your thoughts here..."
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            rows={5}
                                            className="rounded-[14px] border border-[#d8d8d8] px-4 py-3 text-[14px] text-[#2c2c2c] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0c72a6]/20"
                                        />

                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                type="button"
                                                onClick={handleSaveEntry}
                                                className="rounded-full bg-[#0c72a6] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#0a5f8a]"
                                            >
                                                Save Note
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowEntryForm(false);
                                                    setTitle("");
                                                    setContent("");
                                                }}
                                                className="rounded-full border border-[#bdbdbd] bg-white px-5 py-2 text-sm font-medium text-[#4a4a4a] transition hover:bg-[#f7f7f7]"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-8">
                                {Object.keys(groupedEntries).map((groupLabel) => (
                                    <div key={groupLabel}>
                                        <h3 className="mb-4 text-[22px] font-semibold text-[#1f1f1f]">
                                            {groupLabel}
                                        </h3>

                                        <div className="space-y-5">
                                            {groupedEntries[groupLabel].map((entry) => (
                                                <div
                                                    key={entry.id}
                                                    className="overflow-hidden rounded-[18px] bg-white/95 shadow-[0_4px_18px_rgba(0,0,0,0.08)]"
                                                >
                                                    <div className="px-5 py-5">
                                                        {entry.title ? (
                                                            <h4 className="mb-1 text-[18px] font-semibold text-[#1f1f1f]">
                                                                {entry.title}
                                                            </h4>
                                                        ) : null}

                                                        <p className="text-[16px] leading-7 text-[#2e2e2e]">
                                                            {entry.content}
                                                        </p>

                                                    </div>

                                                    <div className="border-t border-[#ececec] px-5 py-3 text-sm text-[#b0b0b0]">
                                                        {formatCardDate(entry.createdAt)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-14">
                                <h2 className="text-[34px] font-bold leading-none text-[#0c72a6]">
                                    Jar of Happiness
                                </h2>
                                <p className="mt-2 text-[18px] italic text-[#2086c4]">
                                    Pick one to brighten up your day
                                </p>

                                <div className="mt-6 rounded-[22px] bg-white/95 px-4 py-6 shadow-[0_4px_18px_rgba(0,0,0,0.08)] sm:px-8">
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleJarClick}
                                            className="mb-2 text-[36px] leading-none text-black transition hover:rotate-90"
                                            title="Shuffle affirmation"
                                        >
                                            ↻
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleJarClick}
                                        className="mx-auto block transition hover:scale-[1.02]"
                                    >
                                        <Image
                                            src="/images/jar.png"
                                            alt="Jar of Happiness"
                                            width={380}
                                            height={420}
                                            className="h-auto w-[240px] sm:w-[300px] lg:w-[360px]"
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {jarOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
                    <div className="relative flex h-[320px] w-[320px] items-center justify-center">
                        <button
                            type="button"
                            onClick={() => setJarOpen(false)}
                            className="absolute right-0 top-0 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-semibold text-[#444] shadow-md hover:bg-[#f7f7f7]"
                        >
                            ×
                        </button>

                        <div
                            className={`flex h-[280px] w-[280px] items-center justify-center rounded-full ${jarColor} p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.18)]`}
                        >
                            <p className="text-[18px] font-medium leading-8 text-white">
                                {jarMessage}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}