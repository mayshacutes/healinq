"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const MISSIONS = {
  daily: [
    { id: 1, icon: "📔", title: "Tulis Jurnal Hari Ini", desc: "Ungkapkan perasaanmu dalam tulisan bebas minimal 50 kata", progress: 1, total: 1, xp: 50, status: "done" },
    { id: 2, icon: "🧘", title: "Sesi Meditasi 10 Menit", desc: "Luangkan waktu untuk bernapas dan hadir di momen ini", progress: 0, total: 1, xp: 30, status: "active" },
    { id: 3, icon: "🌞", title: "Mood Check-in Pagi", desc: "Catat bagaimana perasaanmu di awal hari", progress: 1, total: 1, xp: 20, status: "done" },
  ],
  weekly: [
    { id: 4, icon: "💬", title: "Sesi Konsultasi Minggu Ini", desc: "Jadwalkan & hadiri sesi bersama psikiatermu", progress: 0, total: 1, xp: 150, status: "active" },
    { id: 5, icon: "🍀", title: "Tambah 3 Momen di Jar of Happiness", desc: "Simpan hal-hal kecil yang membuatmu bahagia minggu ini", progress: 2, total: 3, xp: 80, status: "active" },
    { id: 6, icon: "🔥", title: "Jaga Streak 7 Hari", desc: "Login dan lakukan aktivitas selama 7 hari berturut-turut", progress: 7, total: 7, xp: 200, status: "done" },
  ],
  special: [
    { id: 7, icon: "📚", title: "Baca 5 Artikel Kesehatan Mental", desc: "Perkaya pengetahuanmu lewat konten edukasi di HealinQ", progress: 3, total: 5, xp: 100, status: "active" },
    { id: 8, icon: "🔒", title: "Capai Level 15", desc: "Lanjutkan perjalananmu untuk membuka misi ini", progress: 0, total: 1, xp: 500, status: "locked" },
  ],
};

const BADGES = [
  { emoji: "📝", name: "First Word", earned: true },
  { emoji: "🔥", name: "On Fire", earned: true },
  { emoji: "💬", name: "Open Up", earned: true },
  { emoji: "🌟", name: "Star Habit", earned: true },
  { emoji: "🧘", name: "Calm Mind", earned: true },
  { emoji: "🍀", name: "Happy Jar", earned: true },
  { emoji: "🌈", name: "Good Vibes", earned: true },
  { emoji: "💪", name: "Resilient", earned: true },
  { emoji: "🦋", name: "Transform", earned: false },
  { emoji: "🌙", name: "Night Owl", earned: false },
  { emoji: "👑", name: "Legend", earned: false },
  { emoji: "🚀", name: "Max Level", earned: false },
];

const CONSULTATIONS = [
  { id: 1, day: 28, month: "March", doctor: "dr. Sari Dewi, Sp.KJ", time: "15:00 • 60 menit", type: "online", status: "done", note: "Teknik grounding & CBT" },
  { id: 2, day: 16, month: "March", doctor: "dr. Sari Dewi, Sp.KJ", time: "10:00 • 45 menit", type: "offline", status: "done", note: "Evaluasi perkembangan" },
  { id: 3, day: 15, month: "March", doctor: "dr. Sari Dewi, Sp.KJ", time: "13:00 • 60 menit", type: "online", status: "done", note: "Manajemen kecemasan" },
  { id: 4, day: 14, month: "March", doctor: "dr. Budi Santoso, Sp.KJ", time: "09:00 • 30 menit", type: "online", status: "cancelled", note: "Dibatalkan pasien" },
];

const REWARDS = [
  { id: 1, emoji: "🖼️", name: "Frame Profil Bunga", desc: "Hiasi profilmu dengan border bunga cherry blossom", xp: 200, state: "claimed" },
  { id: 2, emoji: "🐰", name: "Avatar Kelinci Sakura", desc: "Avatar eksklusif kelinci dengan mahkota bunga sakura", xp: 300, state: "available" },
  { id: 3, emoji: "💊", name: "Diskon Konsultasi 20%", desc: "Dapatkan potongan harga 20% untuk sesi konsultasi", xp: 500, state: "available" },
];

function formatTopDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getMissionStatusColor(status) {
  if (status === "done") return "bg-[#dff7eb] text-[#1f9d62]";
  if (status === "active") return "bg-[#fde8f3] text-[#db2d8d]";
  return "bg-[#f3f3f3] text-[#7b7b7b]";
}

export default function UserProfilePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("missions");
  const [actionMessage, setActionMessage] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [rewards, setRewards] = useState(REWARDS);

  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();

    localStorage.clear();
    sessionStorage.clear();

    router.replace("/login");
  };

  const [profile, setProfile] = useState({
    name: "Arinda Putri",
    username: "arindaputri",
    bio: "Sedang belajar lebih mengenal diri sendiri satu hari dalam satu waktu 🌱",
    telp_number: "+62 812-3456-7890",
    birth_date: "2002-05-14",
    last_edu: "Mahasiswa Psikologi",
    gender: "Perempuan",
    address: "Surabaya, Jawa Timur",
    doctor: "dr. Sari Dewi",
    image: "/images/icon_profile.png",
  });

  const [editForm, setEditForm] = useState(profile);

  const calcAge = (dateStr) => {
    if (!dateStr) return "-";
    const birth = new Date(dateStr);
    const age = new Date().getFullYear() - birth.getFullYear();
    return `${age} tahun`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!actionMessage) return;
    const timer = setTimeout(() => {
      setActionMessage("");
    }, 2500);
    return () => clearTimeout(timer);
  }, [actionMessage]);

  const handleOpenEditModal = () => {
    setEditForm(profile);
    setShowEditModal(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.username.trim()) {
      setActionMessage("Please complete required fields.");
      return;
    }
    setProfile(editForm);
    setShowEditModal(false);
    setActionMessage("Profile updated successfully.");
  };

  const claimReward = (id, name) => {
    setRewards((prev) => prev.map((r) => (r.id === id ? { ...r, state: "claimed" } : r)));
    setActionMessage(`🎉 "${name}" berhasil diklaim!`);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#d9edf8]">
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

      <section className="relative z-10 w-full px-6 pb-6 pt-40 sm:px-8 lg:px-12">
        <div className="relative">
          <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-[34px] font-bold leading-none text-[#e1268d] sm:text-[42px]">
                My Profile
              </h1>
              <p className="mt-2 text-[18px] text-[#f08bbf]">
                Kelola informasi dan aktivitasmu
              </p>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="w-fit rounded-full bg-white px-5 py-2 text-[15px] font-medium text-[#e85fa7] shadow-sm">
                {formatTopDate(currentDate)}
              </div>

              {actionMessage && (
                <div className="rounded-full bg-white/90 px-4 py-2 text-[13px] font-medium text-[#db2d8d] shadow-sm">
                  {actionMessage}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            {/* Left Section - Profile Info */}
            <div className="space-y-5">
              {/* Profile Card */}
              <div className="rounded-[22px] bg-white/90 p-6 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
                  <div className="flex h-[110px] w-[110px] items-center justify-center rounded-full bg-[#f7d3e4] p-3">
                    <span className="text-[80px]">🐰</span>
                  </div>

                  <div>
                    <h2 className="text-[28px] font-bold text-[#222]">
                      {profile.name}
                    </h2>
                    <p className="mt-1 text-[16px] text-[#666]">@{profile.username}</p>
                    <p className="mt-2 text-[14px] text-[#888]">{profile.bio}</p>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-[16px] bg-[#fff5fa] px-4 py-4">
                    <p className="text-[13px] text-[#ea3f97]">📍 Lokasi</p>
                    <p className="mt-1 text-[16px] font-semibold text-[#222]">
                      {profile.address}
                    </p>
                  </div>

                  <div className="rounded-[16px] bg-[#f4fbff] px-4 py-4">
                    <p className="text-[13px] text-[#0c72a6]">🎂 Usia</p>
                    <p className="mt-1 text-[16px] font-semibold text-[#222]">
                      {calcAge(profile.birth_date)}
                    </p>
                  </div>

                  <div className="rounded-[16px] bg-[#fff5fa] px-4 py-4">
                    <p className="text-[13px] text-[#ea3f97]">⚧️ Jenis Kelamin</p>
                    <p className="mt-1 text-[16px] font-semibold text-[#222]">
                      {profile.gender}
                    </p>
                  </div>

                  <div className="rounded-[16px] bg-[#f4fbff] px-4 py-4">
                    <p className="text-[13px] text-[#0c72a6]">🎓 Pendidikan</p>
                    <p className="mt-1 text-[16px] font-semibold text-[#222]">
                      {profile.last_edu}
                    </p>
                  </div>

                  <div className="rounded-[16px] bg-[#fff5fa] px-4 py-4">
                    <p className="text-[13px] text-[#ea3f97]">📞 Telepon</p>
                    <p className="mt-1 text-[16px] font-semibold text-[#222]">
                      {profile.telp_number}
                    </p>
                  </div>

                  <div className="rounded-[16px] bg-[#f4fbff] px-4 py-4">
                    <p className="text-[13px] text-[#0c72a6]">🩺 Psikiater</p>
                    <p className="mt-1 text-[16px] font-semibold text-[#222]">
                      {profile.doctor}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenEditModal}
                  className="mt-6 w-full rounded-full bg-[#db2d8d] px-5 py-3 text-[14px] font-bold text-white transition hover:bg-[#c8277e]"
                >
                  ✏️ Edit Profile
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-3 w-full rounded-full border border-[#db2d8d] bg-white px-5 py-3 text-[14px] font-bold text-[#db2d8d] transition hover:bg-[#fff0f8]"
                >
                  🚪 Logout
                </button>

              </div>

              {/* Level & Stats */}
              <div className="rounded-[22px] bg-gradient-to-r from-[#8fd0ef] to-[#efb7d5] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-[40px]">🌟</span>
                    <div>
                      <p className="text-[12px] font-bold text-white/80 uppercase tracking-wider">Level Saat Ini</p>
                      <p className="text-[22px] font-bold text-white">Mind Explorer</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[32px] font-bold text-[#fff1a8]">12</p>
                    <p className="text-[12px] text-white/80">dari 50 level</p>
                  </div>
                </div>

                <div className="mb-3 flex justify-between text-[12px] font-bold text-white/90">
                  <span>⚡ 2.400 XP</span>
                  <span>Target: 3.500 XP</span>
                </div>

                <div className="mb-3 h-[10px] rounded-full bg-white/25 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-white to-[#fff1a8]" style={{ width: "68%" }} />
                </div>

                <p className="text-[12px] text-white/90">1.100 XP lagi → Level 13: Soul Seeker ✨</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { icon: "📔", val: "47", label: "Hari Journaling" },
                  { icon: "🧠", val: "8", label: "Sesi Konsultasi" },
                  { icon: "🔥", val: "14", label: "Streak Hari" },
                  { icon: "🏆", val: "9", label: "Badge" },
                ].map((stat, i) => (
                  <div key={i} className="rounded-[16px] bg-white/90 p-4 text-center shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                    <p className="text-[28px] mb-2">{stat.icon}</p>
                    <p className="text-[20px] font-bold text-[#222]">{stat.val}</p>
                    <p className="text-[12px] text-[#666] mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Section - Tabs & Content */}
            <div className="space-y-5">
              {/* Tab Navigation */}
              <div className="flex gap-2 rounded-full bg-white/90 p-2 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                {[
                  { id: "missions", label: "🎯 Misi" },
                  { id: "rewards", label: "🎁 Reward" },
                  { id: "history", label: "📋 Riwayat" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 rounded-full px-4 py-2.5 text-[13px] font-bold transition ${activeTab === tab.id
                      ? "bg-gradient-to-r from-[#8fd0ef] to-[#efb7d5] text-white shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
                      : "text-[#666] hover:text-[#222]"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Missions Tab */}
              {activeTab === "missions" && (
                <div className="space-y-4">
                  {Object.entries(MISSIONS).map(([section, missions]) => (
                    <div key={section}>
                      <h3 className="text-[14px] font-bold text-[#0c72a6] uppercase tracking-wider mb-3 px-2">
                        {section === "daily" && "🌅 Harian"}
                        {section === "weekly" && "📅 Mingguan"}
                        {section === "special" && "🌠 Misi Spesial"}
                      </h3>
                      <div className="space-y-3">
                        {missions.map((m) => {
                          const pct = m.total > 0 ? Math.round((m.progress / m.total) * 100) : 0;
                          return (
                            <div key={m.id} className="rounded-[16px] bg-white/90 p-4 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                              <div className="flex items-start gap-4">
                                <span className="text-[28px]">{m.icon}</span>
                                <div className="flex-1">
                                  <p className="text-[14px] font-bold text-[#222]">{m.title}</p>
                                  <p className="text-[12px] text-[#666] mt-1">{m.desc}</p>
                                  <div className="mt-3 flex items-center gap-2">
                                    <div className="flex-1 h-[6px] bg-[#edf5fa] rounded-full overflow-hidden">
                                      <div className="h-full bg-gradient-to-r from-[#ea1e8c] to-[#8fd0ef]" style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="text-[11px] font-bold text-[#0c72a6]">
                                      {m.status === "done" ? "✓" : `${m.progress}/${m.total}`}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <span className="text-[12px] font-bold bg-[#fff4bf] text-[#9b6b00] px-3 py-1 rounded-full">
                                    ⚡ +{m.xp}
                                  </span>
                                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${getMissionStatusColor(m.status)}`}>
                                    {m.status === "done" ? "✓ Done" : m.status === "active" ? "● Progress" : "🔒 Locked"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Rewards Tab */}
              {activeTab === "rewards" && (
                <div className="grid grid-cols-1 gap-4">
                  {rewards.map((r) => (
                    <div key={r.id} className="rounded-[16px] bg-white/90 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.12)] transition">
                      <div className="flex items-start gap-4">
                        <span className="text-[40px]">{r.emoji}</span>
                        <div className="flex-1">
                          <p className="text-[15px] font-bold text-[#222]">{r.name}</p>
                          <p className="text-[13px] text-[#666] mt-1">{r.desc}</p>
                          <div className="mt-3 flex items-center gap-2">
                            <span className={`text-[12px] font-bold px-3 py-1 rounded-full ${r.state === "locked" ? "bg-[#f1f5f8] text-[#94a3b8]" : "bg-[#fff4bf] text-[#9b6b00]"}`}>
                              {r.state === "locked" ? "🔒 Level 20" : `⚡ ${r.xp} XP`}
                            </span>
                            <button
                              onClick={() => r.state === "available" && claimReward(r.id, r.name)}
                              disabled={r.state !== "available"}
                              className={`ml-auto px-4 py-2 rounded-full text-[12px] font-bold transition ${r.state === "available"
                                ? "bg-gradient-to-r from-[#8fd0ef] to-[#efb7d5] text-white hover:shadow-lg"
                                : "bg-[#f1f5f8] text-[#94a3b8] cursor-not-allowed"
                                }`}
                            >
                              {r.state === "claimed" ? "✓ Claimed" : r.state === "locked" ? "Locked" : "Claim"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Consultation History Tab */}
              {activeTab === "history" && (
                <div className="space-y-3">
                  {CONSULTATIONS.map((c) => (
                    <div key={c.id} className="rounded-[16px] bg-white/90 p-4 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.12)] transition border-l-[4px] border-[#8fd0ef]">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[20px] font-bold text-[#ea1e8c]">{c.day}</span>
                            <span className="text-[13px] font-bold text-[#0c72a6]">{c.month}</span>
                          </div>
                          <p className="text-[14px] font-bold text-[#222]">🩺 {c.doctor}</p>
                          <p className="text-[12px] text-[#666] mt-1">🕐 {c.time}</p>
                          <div className="flex gap-2 mt-3">
                            <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${c.type === "online" ? "bg-[#dff4ff] text-[#0c72a6]" : "bg-[#fde8f3] text-[#db2d8d]"}`}>
                              {c.type === "online" ? "💻 Online" : "🏥 Offline"}
                            </span>
                            <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${c.status === "done" ? "bg-[#dff7eb] text-[#1f9d62]" : "bg-[#f3f3f3] text-[#7b7b7b]"}`}>
                              {c.status === "done" ? "✓ Done" : "✕ Cancelled"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Badges Section */}
              <div className="rounded-[22px] bg-white/90 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                <h3 className="text-[16px] font-bold text-[#222] mb-4">🏅 Badges</h3>
                <div className="grid grid-cols-4 gap-3">
                  {BADGES.map((b, i) => (
                    <div
                      key={i}
                      className={`aspect-square flex flex-col items-center justify-center rounded-[14px] cursor-pointer transition ${b.earned
                        ? "bg-gradient-to-br from-[#fde8f3] to-[#dff4ff]"
                        : "bg-[#f3f3f3] opacity-50"
                        }`}
                      title={b.name}
                    >
                      <span className="text-[24px]">{b.emoji}</span>
                      {b.earned && <span className="text-[10px] font-bold text-[#db2d8d] mt-1">✓</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-[560px] rounded-[24px] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[26px] font-bold text-[#db2d8d]">
                  Edit Profile
                </h2>
                <p className="mt-1 text-[14px] text-[#777]">
                  Update informasi pribadi kamu
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f7] text-[18px] text-[#555] transition hover:bg-[#efefef]"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Nama lengkap"
                value={editForm.name}
                onChange={handleEditFormChange}
                className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              />

              <input
                type="text"
                name="username"
                placeholder="Username"
                value={editForm.username}
                onChange={handleEditFormChange}
                className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              />

              <textarea
                name="bio"
                placeholder="Bio singkat tentang dirimu"
                value={editForm.bio}
                onChange={handleEditFormChange}
                className="w-full rounded-[14px] border border-[#e6e6e6] px-4 py-3 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
                rows={2}
              />

              <input
                type="date"
                name="birth_date"
                value={editForm.birth_date}
                onChange={handleEditFormChange}
                className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              />

              <select
                name="gender"
                value={editForm.gender}
                onChange={handleEditFormChange}
                className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              >
                <option value="Perempuan">Perempuan</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Lainnya">Lainnya</option>
              </select>

              <input
                type="tel"
                name="telp_number"
                placeholder="Nomor telepon"
                value={editForm.telp_number}
                onChange={handleEditFormChange}
                className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              />

              <input
                type="text"
                name="last_edu"
                placeholder="Pendidikan terakhir"
                value={editForm.last_edu}
                onChange={handleEditFormChange}
                className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              />

              <input
                type="text"
                name="address"
                placeholder="Alamat"
                value={editForm.address}
                onChange={handleEditFormChange}
                className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              />

              <input
                type="text"
                name="doctor"
                placeholder="Nama psikiater/konselor"
                value={editForm.doctor}
                onChange={handleEditFormChange}
                className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              />

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-full border border-[#d8d8d8] bg-white px-5 py-2.5 text-[14px] font-medium text-[#555] transition hover:bg-[#f8f8f8]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-full bg-[#db2d8d] px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#c8277e]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}


function MissionCard({ m }) {
  const pct = m.total > 0 ? Math.round((m.progress / m.total) * 100) : 0;
  return (
    <div className={`mcard mcard-${m.status}`}>
      <div className={`micon micon-${m.color}`}>{m.icon}</div>
      <div className="minfo">
        <div className="mtitle">{m.title}</div>
        <div className="mdesc">{m.desc}</div>
        <div className="mprog">
          <div className="pbar">
            <div className={`pfill pfill-${m.color}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="ptext">
            {m.status === "done" ? `${m.total}/${m.total} ✓` : m.status === "locked" ? "Terkunci" : `${m.progress}/${m.total}`}
          </span>
        </div>
      </div>
      <div className="mright">
        <div className="xpreward">⚡ +{m.xp} XP</div>
        <div className={`mstatus mstatus-${m.status}`}>
          {m.status === "done" ? "✓ Selesai" : m.status === "active" ? (pct > 0 && pct < 100 ? "● Progress" : "● Belum") : "🔒 Terkunci"}
        </div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

function ProfilePage() {
  const [activeTab, setActiveTab] = useState("missions");
  const [rewards, setRewards] = useState(REWARDS_INIT);
  const [toast, setToast] = useState(null);
  const [confetti, setConfetti] = useState([]);
  const [editOpen, setEditOpen] = useState(false);

  // ── Profile state — sesuai CDM users ──
  const [profile, setProfile] = useState({
    name: "Arinda Putri",
    username: "arindaputri",
    bio: "Sedang belajar lebih mengenal diri sendiri satu hari dalam satu waktu 🌱",
    telp_number: "+62 812-3456-7890",
    birth_date: "2002-05-14",
    last_edu: "Mahasiswa Psikologi",
    gender: "Perempuan",
    address: "Surabaya, Jawa Timur",
    status: "Aktif",
    doctor: "dr. Sari Dewi",
  });
  const [form, setForm] = useState(profile);

  // Hitung usia dari birth_date
  const calcAge = (dateStr) => {
    if (!dateStr) return "-";
    const birth = new Date(dateStr);
    const age = new Date().getFullYear() - birth.getFullYear();
    return `${age} tahun`;
  };

  const openEdit = () => { setForm(profile); setEditOpen(true); };
  const saveEdit = () => { setProfile(form); setEditOpen(false); showToast("✅ Profil berhasil diperbarui!"); };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const launchConfetti = () => {
    const colors = ["#ea1e8c", "#8fd0ef", "#e2b93b", "#2086c4", "#f28a50", "#22C55E"];
    const pieces = Array.from({ length: 48 }, (_, i) => ({
      id: i, left: Math.random() * 100,
      color: colors[i % colors.length],
      delay: Math.random() * 1.4,
      dur: 1.5 + Math.random(),
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 2800);
  };

  const claimReward = (id, name) => {
    setRewards((prev) => prev.map((r) => (r.id === id ? { ...r, state: "claimed" } : r)));
    launchConfetti();
    showToast(`🎉 "${name}" berhasil diklaim!`);
  };

  return (
    <>
      <style>{css}</style>

      {/* Confetti */}
      {confetti.map((p) => (
        <div key={p.id} className="confpiece" style={{ left: `${p.left}vw`, background: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }} />
      ))}

      {/* Toast */}
      {toast && (
        <div className="toast">
          <span style={{ fontSize: "1.2rem" }}>🎉</span>
          <div className="toast-text">{toast}</div>
        </div>
      )}

      {/* Page */}
      <div className="page">

        {/* ── LEFT ── */}
        <aside className="left">

          {/* Profile Card */}
          <div className="pcard">
            <div className="pbanner" />
            <div className="pbody">
              <div className="av-wrap">
                <div className="av">🐰</div>
                <div className="av-online" />
              </div>
              <div className="pname">{profile.name}</div>
              <div className="phandle">@{profile.username} · Member sejak Jan 2024</div>
              <div className="pbio">{profile.bio}</div>
              <div className="ptags">
                <span className="ptag ptag-pink">😊 Anxiety</span>
                <span className="ptag ptag-teal">🧘 Meditasi</span>
                <span className="ptag ptag-lav">📝 Journaling</span>
              </div>
              <div className="pinfo">
                {[
                  ["📍", profile.address],
                  ["🎂", calcAge(profile.birth_date)],
                  ["⚧️", profile.gender],
                  ["📞", profile.telp_number],
                  ["🎓", profile.last_edu],
                  ["🩺", profile.doctor + " (Psikiaterku)"],
                ].map(([icon, txt]) => (
                  <div className="pinfo-row" key={icon}><span>{icon}</span>{txt}</div>
                ))}
              </div>
              <button className="edit-btn" onClick={openEdit}>✏️ Edit Profil</button>
              <div className="pinfo" style={{ marginTop: "12px", gap: "8px" }}>
                <button className="edit-btn" style={{ background: "#f28a50", fontSize: "0.8rem" }} onClick={() => alert("Fitur ubah password akan segera hadir!")}>🔑 Ubah Password</button>
                <button className="edit-btn" style={{ background: "#ea1e8c", fontSize: "0.8rem" }} onClick={() => signOut()}>🚪 Sign Out</button>
              </div>
            </div>
          </div>

          {/* Level Card */}
          <div className="lcard">
            <div className="ltop">
              <div className="lbadge">
                <span style={{ fontSize: "1.7rem" }}>🌟</span>
                <div>
                  <div className="llabel">Level saat ini</div>
                  <div className="lname">Mind Explorer</div>
                </div>
              </div>
              <div>
                <div className="lnum">12</div>
                <div className="lsub">dari 50 level</div>
              </div>
            </div>
            <div className="xp-labels"><span>⚡ 2.400 XP</span><span>Target: 3.500 XP</span></div>
            <div className="xp-bar"><div className="xp-fill" /></div>
            <div className="xp-next">1.100 XP lagi → Level 13: Soul Seeker ✨</div>
          </div>

          {/* Stats */}
          <div className="sgrid">
            {[["📔", "47", "Hari Journaling"], ["🧠", "8", "Sesi Konsultasi"], ["🔥", "14", "Streak Hari Ini"], ["🏆", "9", "Badge Diraih"]].map(([icon, val, lbl]) => (
              <div className="smini" key={lbl}>
                <div className="smini-icon">{icon}</div>
                <div className="smini-val">{val}</div>
                <div className="smini-lbl">{lbl}</div>
              </div>
            ))}
          </div>

          {/* Badges */}
          <div className="bcard">
            <div className="ctitle">🏅 Badge Koleksiku</div>
            <div className="bgrid">
              <div className="bitem bitem-earned bitem-earned-pink">
                <span className="bemoji">🏆</span>
                <span className="bname">{BADGES.filter(b => b.earned).length} Badge Diraih</span>
              </div>
            </div>
          </div>

        </aside>

        {/* ── RIGHT ── */}
        <main className="right">

          {/* Tabs */}
          <div className="tabs">
            {[["missions", "🎯 Misi"], ["rewards", "🎁 Reward"], ["history", "📋 Riwayat"]].map(([id, label]) => (
              <button key={id} className={`tab ${activeTab === id ? "tab-active" : ""}`} onClick={() => setActiveTab(id)}>
                {label}
              </button>
            ))}
          </div>

          {/* ── MISSIONS ── */}
          {activeTab === "missions" && (
            <div>
              <div className="sec-head">
                <h2>Misi Aktif ⚡</h2>
                <div className="score-chip">⭐ 2.400 XP</div>
              </div>
              <div className="mlist">
                <div className="mlabel">🌅 Harian</div>
                {MISSIONS.daily.map((m) => <MissionCard key={m.id} m={m} />)}
                <div className="mlabel">📅 Mingguan</div>
                {MISSIONS.weekly.map((m) => <MissionCard key={m.id} m={m} />)}
                <div className="mlabel">🌠 Misi Spesial</div>
                {MISSIONS.special.map((m) => <MissionCard key={m.id} m={m} />)}
              </div>
            </div>
          )}

          {/* ── REWARDS ── */}
          {activeTab === "rewards" && (
            <div>
              <div className="sec-head">
                <h2>Reward Tersedia 🎁</h2>
                <div className="score-chip">⭐ 2.400 XP</div>
              </div>
              <div className="rgrid">
                {rewards.map((r) => (
                  <div key={r.id} className={`rcard rcard-${r.state}`}>
                    <span className="remoji">{r.emoji}</span>
                    <div className="rname">{r.name}</div>
                    <div className="rdesc">{r.desc}</div>
                    <div className={r.state === "locked" ? "rcost rcost-grey" : "rcost"}>
                      {r.state === "locked" ? "🔒 Level 20" : `⚡ ${r.xp} XP`}
                    </div>
                    <button
                      className={`rbtn ${r.state === "available" ? "rbtn-claim" : "rbtn-off"}`}
                      disabled={r.state !== "available"}
                      onClick={() => r.state === "available" && claimReward(r.id, r.name)}
                    >
                      {r.state === "claimed" ? "✓ Sudah Diklaim" : r.state === "locked" ? "Belum Terbuka" : "Klaim Sekarang"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── HISTORY ── */}
          {activeTab === "history" && (
            <div>
              <div className="sec-head">
                <h2>Consultation History 🩺</h2>
                <span style={{ fontSize: ".8rem", color: "var(--text-light)", fontWeight: 700 }}>
                  {CONSULTATIONS.length} sesi total
                </span>
              </div>
              <div className="ch-grid">
                {CONSULTATIONS.map((c) => (
                  <div key={c.id} className={`ch-card ${c.type === "online" ? "ch-online" : ""} ${c.status === "cancelled" ? "ch-cancelled" : ""}`}>
                    <div className="ch-date-num">{c.day}</div>
                    <div className="ch-date-month">{c.month}</div>
                    <div className="ch-divider" />
                    <div className="ch-doctor">🩺 {c.doctor}</div>
                    <div className="ch-time">🕐 {c.time}</div>
                    <div className="ch-badges">
                      <span className={`ch-badge ${c.type === "online" ? "ch-badge-teal" : "ch-badge-pink"}`}>
                        {c.type === "online" ? "💻 Online" : "🏥 Offline"}
                      </span>
                      <span className={`ch-badge ${c.status === "done" ? "ch-badge-teal" : "ch-badge-grey"}`}>
                        {c.status === "done" ? "✓ Selesai" : "✕ Batal"}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="ch-see-all">📋 Lihat Semua</div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── EDIT MODAL ── */}
      {editOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditOpen(false)}>
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">✏️ Edit Profil</div>
              <button className="modal-close" onClick={() => setEditOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              {/* name + username */}
              <div className="field-row">
                <div className="field">
                  <label>Nama Lengkap</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama lengkap" />
                </div>
                <div className="field">
                  <label>Username</label>
                  <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="username" />
                </div>
              </div>
              {/* bio */}
              <div className="field">
                <label>Bio</label>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Ceritakan sedikit tentang dirimu..." />
              </div>
              {/* birth_date + gender */}
              <div className="field-row">
                <div className="field">
                  <label>Tanggal Lahir</label>
                  <input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
                </div>
                <div className="field">
                  <label>Jenis Kelamin</label>
                  <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                    <option value="Perempuan">Perempuan</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>
              {/* telp_number + last_edu */}
              <div className="field-row">
                <div className="field">
                  <label>Nomor Telepon</label>
                  <input value={form.telp_number} onChange={(e) => setForm({ ...form, telp_number: e.target.value })} placeholder="+62 8xx-xxxx-xxxx" />
                </div>
                <div className="field">
                  <label>Pendidikan Terakhir</label>
                  <input value={form.last_edu} onChange={(e) => setForm({ ...form, last_edu: e.target.value })} placeholder="cth: S1 Psikologi" />
                </div>
              </div>
              {/* address + doctor */}
              <div className="field-row">
                <div className="field">
                  <label>Alamat</label>
                  <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Kota, Provinsi" />
                </div>
                <div className="field">
                  <label>Nama Psikiater</label>
                  <input value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} placeholder="dr. Nama, Sp.KJ" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setEditOpen(false)}>Batal</button>
              <button className="btn-save" onClick={saveEdit}>💾 Simpan Perubahan</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
