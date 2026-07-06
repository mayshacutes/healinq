"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getDailyLyric } from "@/lib/dailyLyric";
import { supabase } from "@/lib/supabaseClient";
function formatGreetingDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function parseSafe(dateString) {
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? null : d;
}

function formatMonthShort(dateString) {
  const d = parseSafe(dateString);
  if (!d) return "-";
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(d);
}

function formatDay(dateString) {
  const d = parseSafe(dateString);
  if (!d) return "--";
  return new Intl.DateTimeFormat("en-US", { day: "2-digit" }).format(d);
}

function formatTime(dateString) {
  const d = parseSafe(dateString);
  if (!d) return "--:--";
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

function getRelativeLabel(dateString) {
  const entryDate = parseSafe(dateString);
  if (!entryDate) return "-";
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
  const [consultations, setConsultations] = useState([]);
  const [counselorsData, setCounselorsData] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const waitForSession = async () => {
      // Coba cek session beberapa kali, karena OAuth kadang butuh waktu sebentar
      for (let i = 0; i < 10; i++) {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          return session.user;
        }

        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      return null;
    };

    const loadUser = async () => {
      const user = await waitForSession();

      if (!isMounted) return;

      if (!user) {
        router.replace("/login");
        return;
      }

      let { data: profile, error: profileFetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileFetchError) {
        console.error("Gagal mengambil profile:", profileFetchError.message);
      }

      // Kalau user login Google dan belum ada data profile, buat otomatis
      if (!profile) {
        const username =
          user.user_metadata?.username ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Buddy";

        const { data: newProfile, error: profileCreateError } = await supabase
          .from("profiles")
          .upsert(
            {
              id: user.id,
              username,
              email: user.email,
            },
            {
              onConflict: "id",
            }
          )
          .select("*")
          .single();

        if (profileCreateError) {
          console.error("Gagal membuat profile:", profileCreateError.message);
        }

        profile = newProfile;
      }

      if (!isMounted) return;

      setCurrentUser({
        username: profile?.username || "Buddy",
        email: user.email,
      });

      // Ambil consultation history
      const { data: consultData } = await supabase
        .from("consultations")
        .select("id, consultation_date, consultation_hour, counselor_name, consultation_type, session_duration, status")
        .eq("client_id", user.id)
        .order("consultation_date", { ascending: false })
        .limit(6);
      if (consultData) setConsultations(consultData);

      // Ambil daftar konselor aktif
      const { data: counselorData } = await supabase
        .from("counselors")
        .select("id, name, specialty")
        .eq("status", "Active")
        .limit(4);
      if (counselorData) setCounselorsData(counselorData);

      // Ambil journal entries dari database
      const { data: journalData } = await supabase
        .from("journal_entries")
        .select("id, title, content, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(4);
      if (journalData && journalData.length > 0) {
        setRecentEntries(journalData);
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const dailyLyric = useMemo(() => getDailyLyric(), []);
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
          <div className="flex items-center gap-4 rounded-full bg-[#efb7d5] px-4 py-3 shadow-[0_4px_14px_rgba(0,0,0,0.12)]">
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
                {consultations.length === 0 ? (
                  <p className="col-span-full text-center text-gray-400 text-sm py-8">
                    Belum ada riwayat konsultasi.
                  </p>
                ) : consultations.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => router.push("/profile")}
                    className="rounded-[12px] border border-[#ef9fca] bg-[#f7d6ea] p-2 transition hover:scale-[1.02]"
                  >
                    <div className="relative rounded-[10px] bg-white px-4 py-5 shadow-inner">
                      <div className="absolute bottom-2 left-2 top-2 w-[6px] rounded-full bg-[#ea4aa0]" />
                      <div className="text-center">
                        <div className="text-[34px] font-bold leading-none text-[#e91c89]">
                          {formatDay(c.consultation_date)}
                        </div>
                        <div className="mt-1 text-[18px] text-[#f06db2]">
                          {formatMonthShort(c.consultation_date)}
                        </div>
                        <p className="mt-1 text-[11px] text-gray-400 truncate">{c.counselor_name}</p>
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
                  onClick={() => router.push("/consultation/list")}
                  className="rounded-[8px] border border-[#5a6d73] bg-[#b8edf0] px-4 py-1.5 text-[14px] text-[#28353a] transition hover:scale-[1.02] sm:px-5 sm:text-[16px]"
                >
                  View All
                </button>
              </div>

              <div className="space-y-3">
                {counselorsData.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-4">
                    Belum ada konselor tersedia.
                  </p>
                ) : counselorsData.map((c, index) => (
                  <div key={c.id}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-[54px] w-[54px] items-center justify-center rounded-full border border-[#5166b3] bg-[#bde3f5]">
                        <span className="text-[24px]">👤</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-bold text-[#1f1f1f]">
                          {c.name}
                        </p>
                        <p className="text-[14px] text-[#4e4e4e]">
                          {c.specialty || "Konselor"}
                        </p>
                      </div>

                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => router.push(`/consultation/booking/${c.id}`)}
                          className="rounded-full bg-[#80b8ea] px-4 py-1 text-[14px] text-white transition hover:bg-[#6aa9e2]"
                        >
                          Book
                        </button>
                      </div>
                    </div>

                    {index !== counselorsData.length - 1 && (
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
                My Profile
              </h3>
              <p className="mt-2 text-[14px] text-[#f06db2]">Lihat dan edit informasi profil kamu</p>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}