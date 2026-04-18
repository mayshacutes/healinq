"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getDailyLyric } from "@/lib/dailyLyric";

const counselors = [
  { id: 1, name: "Jessica Atalya Kriswianto", specialty: "Stress Management", rating: 4.5 },
  { id: 2, name: "Jessica Atalya Kriswianto", specialty: "Stress Management", rating: 4.5 },
  { id: 3, name: "Jessica Atalya Kriswianto", specialty: "Stress Management", rating: 4.5 },
  { id: 4, name: "Jessica Atalya Kriswianto", specialty: "Stress Management", rating: 4.4 },
  { id: 5, name: "Jessica Atalya Kriswianto", specialty: "Stress Management", rating: 4.4 },
  { id: 6, name: "Jessica Atalya Kriswianto", specialty: "Stress Management", rating: 4.3 },
];

const fallbackJournalEntries = [
  {
    id: 1,
    title: "I Hate My Life Lately...",
    content: "I feel tired with everything lately, but I am trying to keep going one step at a time.",
    createdAt: "2026-03-08T15:18:00",
    mood: "😟",
  },
  {
    id: 2,
    title: "I Hate My Life Lately...",
    content: "Some days feel heavier than others, and today was one of those days.",
    createdAt: "2026-03-09T15:18:00",
    mood: "😟",
  },
  {
    id: 3,
    title: "Finally, I Found My Passion...",
    content: "I finally found something that makes me excited and feel alive again.",
    createdAt: "2026-03-10T18:18:00",
    mood: "😄",
  },
  {
    id: 4,
    title: "People Always Leave. Don’t Get...",
    content: "It hurts when people leave, but I want to learn how to be okay with myself too.",
    createdAt: "2026-03-11T12:10:00",
    mood: "😟",
  },
];

const consultationHistory = [
  { id: 1, day: "16", month: "March" },
  { id: 2, day: "15", month: "March" },
  { id: 3, day: "14", month: "March" },
  { id: 4, day: "13", month: "March" },
  { id: 5, day: "12", month: "March" },
  { id: 6, day: "11", month: "March" },
  { id: 7, day: "10", month: "March" },
  { id: 8, day: "11", month: "March" },
  { id: 9, day: "10", month: "March" },
];

function formatGreetingDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatMonthShort(dateString) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
  }).format(new Date(dateString));
}

function formatDay(dateString) {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
  }).format(new Date(dateString));
}

function formatTime(dateString) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(dateString));
}

function getRelativeLabel(dateString) {
  const entryDate = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  const twoDaysAgo = new Date();
  const threeDaysAgo = new Date();

  yesterday.setDate(today.getDate() - 1);
  twoDaysAgo.setDate(today.getDate() - 2);
  threeDaysAgo.setDate(today.getDate() - 3);

  const normalize = (date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

  const entry = normalize(entryDate);

  if (entry === normalize(today)) return "Today";
  if (entry === normalize(yesterday)) return "Yesterday";
  if (entry === normalize(twoDaysAgo)) return "2 Days Ago";
  if (entry === normalize(threeDaysAgo)) return "3 Days Ago";

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(entryDate);
}

export default function UserDashboardPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [recentEntries, setRecentEntries] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const storedCurrentUser = JSON.parse(localStorage.getItem("currentUser"));

    const fallbackUser = {
      username: "Buddy",
      email: "buddy@example.com",
      xp: 1240,
      streak: 7,
      level: 8,
      nextLevelXp: 260,
    };

    const activeUser = storedCurrentUser || fallbackUser;

    setCurrentUser({
      ...fallbackUser,
      ...activeUser,
    });

    const journalKey = `journalEntries_${activeUser?.email || fallbackUser.email}`;
    const existingEntries = JSON.parse(localStorage.getItem(journalKey));

    if (existingEntries && Array.isArray(existingEntries) && existingEntries.length > 0) {
      setRecentEntries(existingEntries.slice(0, 4));
    } else {
      localStorage.setItem(journalKey, JSON.stringify(fallbackJournalEntries));
      setRecentEntries(fallbackJournalEntries.slice(0, 4));
    }
  }, []);

  const dailyLyric = useMemo(() => getDailyLyric(), []);
  const xpValue = currentUser?.xp || 1240;
  const levelValue = currentUser?.level || 8;
  const streakValue = currentUser?.streak || 7;
  const nextLevelXp = currentUser?.nextLevelXp || 260;
  const progressPercent = Math.min((xpValue / 1500) * 100, 100);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#d7edf7]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0">
        <Image
          src="/images/header.png"
          alt=""
          width={1920}
          height={281}
          priority
          className="h-auto w-full object-cover"
        />
      </div>

      <section className="relative z-0 w-full px-4 pb-8 pt-24 md:px-8 xl:px-10">
        <div className="mb-6 flex items-start justify-end">
          <div className="flex items-center gap-4 rounded-full bg-[#8fd0ef] px-4 py-3 shadow-[0_4px_14px_rgba(0,0,0,0.12)]">
            <div className="flex items-center gap-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#79bde4] bg-[#dff4ff] text-[12px] font-semibold text-[#74a4d4]">
                XP
              </div>
              <span className="text-[18px] font-bold text-white">
                {xpValue.toLocaleString("en-US")}
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-[#efb7d5] px-4 py-2">
              <Image
                src="/images/maskot1.png"
                alt="Mascot"
                width={42}
                height={42}
                className="h-[42px] w-[42px] object-contain"
              />
              <Image
                src="/images/logo.png"
                alt="HealinQ Logo"
                width={56}
                height={28}
                className="h-auto w-[56px] object-contain"
              />
            </div>
          </div>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-[36px] font-extrabold leading-none text-[#ea1e8c] sm:text-[44px] md:text-[52px]">
            Hello, {currentUser?.username || "Buddy"}!
          </h1>
          <p className="mt-3 text-[14px] text-[#f06db2] sm:text-[16px]">
            {formatGreetingDate(currentDate)}. How&apos;s your day?
          </p>
        </div>

        <div className="mb-8 rounded-[20px] bg-[#e8d6e7] px-5 py-6 shadow-[0_4px_10px_rgba(0,0,0,0.15)] sm:px-7">
          <div className="grid items-center gap-5 lg:grid-cols-[1fr_260px]">
            <div>
              <p className="text-[18px] leading-[1.8] text-[#eb1987] sm:text-[21px] md:text-[24px]">
                Aku Alin! tahukah kamu, seperti kelinci yang suka menggali,
                psikologi mengajak kita untuk &apos;menggali&apos; lebih dalam ke
                dalam diri sendiri. Aku di sini sebagai teman dalam petualangan
                introspeksi itu. Dari sini, kita bisa tumbuh, melompat lebih
                tinggi, dan menjalani hidup dengan lebih sadar. Selamat datang
                di ruang tumbuh kita bersama!
              </p>
            </div>

            <div className="flex justify-center lg:justify-end">
              <Image
                src="/images/maskot1.png"
                alt="Mascot"
                width={250}
                height={220}
                className="h-auto w-[180px] sm:w-[220px] object-contain"
              />
            </div>
          </div>
        </div>

        <h2 className="mb-4 text-[24px] font-extrabold uppercase tracking-wide text-[#ef78b7] sm:text-[28px]">
          Quick Access
        </h2>

        <div className="grid gap-6 xl:grid-cols-[1.8fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-[18px] bg-[#dbe7ef] p-5 shadow-[0_4px_10px_rgba(0,0,0,0.12)]">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h3 className="text-[22px] font-extrabold text-[#e91c89] sm:text-[28px]">
                  Recent Journal
                </h3>

                <button
                  type="button"
                  onClick={() => router.push("/journaling?new=true")}
                  className="rounded-[8px] border border-[#5a6d73] bg-[#b8edf0] px-4 py-1.5 text-[16px] text-[#28353a] transition hover:scale-[1.02] sm:px-6 sm:text-[18px]"
                >
                  ⊕ New
                </button>
              </div>

              <div className="space-y-4">
                {recentEntries.map((entry, index) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => router.push("/journaling?new=true")}
                    className="block w-full text-left"
                  >
                    <div className="flex items-center gap-4 py-2">
                      <div className="flex h-[96px] w-[82px] shrink-0 flex-col items-center justify-center rounded-[14px] bg-[#ace7ef] text-center shadow-inner">
                        <span className="text-[28px] font-bold leading-none text-[#eb1987]">
                          {formatDay(entry.createdAt)}
                        </span>
                        <span className="mt-1 text-[18px] leading-none text-[#f06db2]">
                          {formatMonthShort(entry.createdAt)}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 text-[24px]">{entry.mood || "😟"}</div>
                        <p className="truncate text-[16px] text-[#2d2d2d] sm:text-[18px]">
                          {entry.title || entry.content}
                        </p>
                        <p className="mt-1 text-[14px] font-semibold text-[#f06db2] sm:text-[16px]">
                          {formatTime(entry.createdAt)} . {getRelativeLabel(entry.createdAt)}
                        </p>
                      </div>
                    </div>

                    {index !== recentEntries.length - 1 && (
                      <div className="mt-2 border-b border-[#707070]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[18px] bg-[#dbe7ef] p-5 shadow-[0_4px_10px_rgba(0,0,0,0.12)]">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h3 className="text-[22px] font-extrabold text-[#e91c89] sm:text-[28px]">
                  Consultation History
                </h3>

                <button
                  type="button"
                  onClick={() => router.push("/profile")}
                  className="rounded-[8px] border border-[#5a6d73] bg-[#b8edf0] px-4 py-1.5 text-[16px] text-[#28353a] transition hover:scale-[1.02] sm:px-6 sm:text-[18px]"
                >
                  See All
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {consultationHistory.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => router.push("/profile")}
                    className="rounded-[12px] border border-[#ef9fca] bg-[#f7d6ea] p-2 transition hover:scale-[1.02]"
                  >
                    <div className="relative rounded-[10px] bg-white px-4 py-5 shadow-inner">
                      <div className="absolute bottom-2 left-2 top-2 w-[6px] rounded-full bg-[#ea4aa0]" />
                      <div className="text-center">
                        <div className="text-[34px] font-bold leading-none text-[#e91c89]">
                          {item.day}
                        </div>
                        <div className="mt-1 text-[18px] text-[#f06db2]">
                          {item.month}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/fyp")}
              className="block w-full rounded-[18px] bg-[#bfe5ee] p-5 text-left shadow-[0_4px_10px_rgba(0,0,0,0.12)] transition hover:scale-[1.01]"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-full bg-[#d9edf8] px-4 py-2 text-[16px] font-medium text-[#273238] shadow">
                  🎵 Lyric Of The Day
                </div>
              </div>

              <h4 className="text-[24px] font-semibold text-[#1d2e35] sm:text-[28px]">
                {dailyLyric.title}
              </h4>

              <p className="mt-3 max-w-[760px] text-[16px] leading-8 text-[#1d2e35] sm:text-[17px]">
                “{dailyLyric.lyric}”
              </p>

              <p className="mt-4 text-[14px] font-medium text-[#2086c4]">
                Auto updated daily • Tap to open FYP
              </p>
            </button>
          </div>

          <div className="space-y-6">
            <button
              type="button"
              onClick={() => router.push("/journaling")}
              className="block w-full rounded-[18px] bg-[#bfe8e8] p-5 text-left shadow-[0_4px_10px_rgba(0,0,0,0.12)] transition hover:scale-[1.02]"
            >
              <div className="mb-4">
                <div className="mb-2 text-[44px] leading-none text-white">📔</div>
                <h3 className="text-[24px] font-extrabold leading-tight text-[#1172a8]">
                  Daily Journaling
                </h3>
                <p className="text-[18px] text-[#2b4857]">
                  Write Your Own Feelings
                </p>
              </div>
            </button>

            <div className="rounded-[18px] bg-[#bfe8e8] p-5 shadow-[0_4px_10px_rgba(0,0,0,0.12)]">
              <h3 className="text-[24px] font-extrabold text-[#1172a8]">
                Jar of Happiness
              </h3>

              <button
                type="button"
                onClick={() => router.push("/journaling?jar=true")}
                className="mt-4 block w-full text-center transition hover:scale-[1.02]"
              >
                <p className="mb-2 text-[18px] text-[#1d2e35]">Click Here!</p>
                <Image
                  src="/images/jar.png"
                  alt="Jar of Happiness"
                  width={220}
                  height={260}
                  className="mx-auto h-auto w-[180px] object-contain"
                />
              </button>
            </div>

            <div className="rounded-[18px] bg-[#dbe7ef] p-5 shadow-[0_4px_10px_rgba(0,0,0,0.12)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-[22px] font-extrabold text-[#e91c89] sm:text-[28px]">
                  Counselor
                </h3>

                <button
                  type="button"
                  onClick={() => router.push("/list")}
                  className="rounded-[8px] border border-[#5a6d73] bg-[#b8edf0] px-4 py-1.5 text-[14px] text-[#28353a] transition hover:scale-[1.02] sm:px-5 sm:text-[16px]"
                >
                  View All
                </button>
              </div>

              <div className="space-y-3">
                {counselors.map((counselor, index) => (
                  <div key={counselor.id}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-[54px] w-[54px] items-center justify-center rounded-full border border-[#5166b3] bg-[#bde3f5]">
                        <span className="text-[24px]">👤</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-bold text-[#1f1f1f]">
                          {counselor.name}
                        </p>
                        <p className="text-[14px] text-[#4e4e4e]">
                          {counselor.specialty}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[18px] font-semibold text-[#1f1f1f]">
                          ⭐ {counselor.rating}
                        </p>
                        <button
                          type="button"
                          onClick={() => router.push(`/consultation/booking/${counselor.id}`)}
                          className="mt-1 rounded-full bg-[#80b8ea] px-4 py-1 text-[14px] text-white transition hover:bg-[#6aa9e2]"
                        >
                          Book
                        </button>
                      </div>
                    </div>

                    {index !== counselors.length - 1 && (
                      <div className="mt-3 border-b border-[#707070]" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="block w-full rounded-[18px] bg-[#dbe7ef] p-5 text-left shadow-[0_4px_10px_rgba(0,0,0,0.12)] transition hover:scale-[1.01]"
            >
              <h3 className="text-[22px] font-extrabold text-[#e91c89] sm:text-[28px]">
                Your Score Progress
              </h3>

              <div className="mt-4 rounded-[16px] bg-[#d7eef0] p-4">
                <div className="mb-2 flex items-center justify-between text-[16px] text-[#f06db2]">
                  <span>Streak</span>
                  <span className="font-semibold">{streakValue} days</span>
                </div>

                <div className="mb-2 flex items-center justify-between text-[16px] text-[#f06db2]">
                  <span>XP</span>
                  <span className="font-semibold">{xpValue.toLocaleString("en-US")}</span>
                </div>

                <div className="mb-3 flex items-center justify-between text-[16px] text-[#f06db2]">
                  <span>Level</span>
                  <span className="font-semibold">{levelValue}</span>
                </div>

                <div className="h-[10px] w-full overflow-hidden rounded-full bg-[#c3d6d9]">
                  <div
                    className="h-full rounded-full bg-[#ea1e8c]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <p className="mt-3 text-[14px] text-[#f06db2]">
                  Next level in {nextLevelXp} XP
                </p>
              </div>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}