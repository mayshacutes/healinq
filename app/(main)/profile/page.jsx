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
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const [profile, setProfile] = useState({
    full_name: "",
    username: "",
    bio: "",
    telp_number: "",
    birth_date: "",
    last_edu: "",
    gender: "",
    address: "",
    doctor: "",
  });

  const [editForm, setEditForm] = useState(profile);

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
        if (error.code === "PGRST116") {
          const defaultProfile = {
            id: user.id,
            full_name: user.email?.split("@")[0] || "User",
            username: user.email?.split("@")[0] || "user",
            email: user.email,
            exp: 0,
            streak: 0,
            level: 1,
            nextLevelXp: 100,
            bio: "",
            telp_number: "",
            birth_date: null,
            gender: "",
            address: "",
            last_edu: "",
            doctor: "",
          };
          await supabase.from("profiles").insert(defaultProfile);
          setProfile(defaultProfile);
          setEditForm(defaultProfile);
        } else {
          setActionMessage("Gagal memuat profil.");
        }
      } else if (data) {
        setProfile(data);
        setEditForm(data);
      }
      setIsLoading(false);
    }
    loadProfile();
  }, [router]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!actionMessage) return;
    const timer = setTimeout(() => setActionMessage(""), 2500);
    return () => clearTimeout(timer);
  }, [actionMessage]);

  const calcAge = (dateStr) => {
    if (!dateStr) return "-";
    const birth = new Date(dateStr);
    const age = new Date().getFullYear() - birth.getFullYear();
    return `${age} tahun`;
  };

  const handleOpenEditModal = () => {
    setEditForm(profile);
    setShowEditModal(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editForm.full_name?.trim() || !editForm.username?.trim()) {
      setActionMessage("Nama dan username harus diisi.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setActionMessage("Anda harus login.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: editForm.full_name,
        username: editForm.username,
        bio: editForm.bio,
        telp_number: editForm.telp_number,
        birth_date: editForm.birth_date,
        gender: editForm.gender,
        address: editForm.address,
        last_edu: editForm.last_edu,
        doctor: editForm.doctor,
      })
      .eq("id", user.id);

    if (error) {
      console.error(error);
      setActionMessage("Gagal menyimpan perubahan.");
    } else {
      setProfile(editForm);
      setShowEditModal(false);
      setActionMessage("Profil berhasil diperbarui!");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    router.replace("/login");
  };

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((p) => ({ ...p, [name]: value }));
  };

  const getPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    const percent = Math.min(100, (score / 5) * 100);
    const label = score <= 2 ? "Weak" : score <= 4 ? "Medium" : "Strong";
    const color = score <= 2 ? "bg-[#f8c3d0]" : score <= 4 ? "bg-[#f9e29d]" : "bg-[#a7e5a8]";
    return { percent, label, color };
  };

  const handleSendPasswordReset = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      setActionMessage("Email tidak ditemukan.");
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      setResetEmailSent(true);
      setActionMessage("Email reset password terkirim.");
    } catch (err) {
      console.error(err);
      setActionMessage("Gagal mengirim email reset.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      setActionMessage("User tidak valid.");
      return;
    }
    if (!passwordForm.currentPassword) {
      setActionMessage("Password saat ini harus diisi.");
      return;
    }
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
      setActionMessage("Password baru minimal 8 karakter.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setActionMessage("Konfirmasi password tidak cocok.");
      return;
    }
    try {
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordForm.currentPassword,
      });
      if (reauthError) {
        setActionMessage("Password saat ini salah.");
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword });
      if (error) throw error;
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setResetEmailSent(false);
      setActionMessage("Password berhasil diubah.");
    } catch (err) {
      console.error(err);
      setActionMessage("Gagal mengubah password.");
    }
  };

  const claimReward = (id, name) => {
    setRewards((prev) => prev.map((r) => (r.id === id ? { ...r, state: "claimed" } : r)));
    setActionMessage(`🎉 "${name}" berhasil diklaim!`);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#d9edf8]">
        <div className="text-[#db2d8d] text-xl">Memuat profil...</div>
      </main>
    );
  }

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
              <h1 className="text-[34px] font-bold leading-none text-[#e1268d] sm:text-[42px]">My Profile</h1>
              <p className="mt-2 text-[18px] text-[#f08bbf]">Kelola informasi dan aktivitasmu</p>
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
            {/* LEFT SECTION */}
            <div className="space-y-5">
              {/* Profile Card */}
              <div className="rounded-[22px] bg-white/90 p-6 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
                  <div className="flex h-[110px] w-[110px] items-center justify-center rounded-full bg-[#f7d3e4] p-3">
                    <span className="text-[80px]">🐰</span>
                  </div>
                  <div>
                    <h2 className="text-[28px] font-bold text-[#222]">{profile.full_name || profile.username}</h2>
                    <p className="mt-1 text-[16px] text-[#666]">@{profile.username}</p>
                    <p className="mt-2 text-[14px] text-[#888]">{profile.bio}</p>
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-[16px] bg-[#fff5fa] px-4 py-4">
                    <p className="text-[13px] text-[#ea3f97]">📍 Lokasi</p>
                    <p className="mt-1 text-[16px] font-semibold text-[#222]">{profile.address}</p>
                  </div>
                  <div className="rounded-[16px] bg-[#f4fbff] px-4 py-4">
                    <p className="text-[13px] text-[#0c72a6]">🎂 Usia</p>
                    <p className="mt-1 text-[16px] font-semibold text-[#222]">{calcAge(profile.birth_date)}</p>
                  </div>
                  <div className="rounded-[16px] bg-[#fff5fa] px-4 py-4">
                    <p className="text-[13px] text-[#ea3f97]">⚧️ Jenis Kelamin</p>
                    <p className="mt-1 text-[16px] font-semibold text-[#222]">{profile.gender}</p>
                  </div>
                  <div className="rounded-[16px] bg-[#f4fbff] px-4 py-4">
                    <p className="text-[13px] text-[#0c72a6]">🎓 Pendidikan</p>
                    <p className="mt-1 text-[16px] font-semibold text-[#222]">{profile.last_edu}</p>
                  </div>
                  <div className="rounded-[16px] bg-[#fff5fa] px-4 py-4">
                    <p className="text-[13px] text-[#ea3f97]">📞 Telepon</p>
                    <p className="mt-1 text-[16px] font-semibold text-[#222]">{profile.telp_number}</p>
                  </div>
                  <div className="rounded-[16px] bg-[#f4fbff] px-4 py-4">
                    <p className="text-[13px] text-[#0c72a6]">🩺 Psikiater</p>
                    <p className="mt-1 text-[16px] font-semibold text-[#222]">{profile.doctor}</p>
                  </div>
                </div>
                <button onClick={handleOpenEditModal} className="mt-6 w-full rounded-full bg-[#db2d8d] px-5 py-3 text-[14px] font-bold text-white transition hover:bg-[#c8277e]">
                  ✏️ Edit Profile
                </button>
                <button onClick={() => setShowPasswordModal(true)} className="mt-3 w-full rounded-full bg-[#f28a50] px-5 py-3 text-[14px] font-bold text-white transition hover:bg-[#d76a44]">
                  🔑 Ubah Password
                </button>
                <button onClick={handleLogout} className="mt-3 w-full rounded-full border border-[#db2d8d] bg-white px-5 py-3 text-[14px] font-bold text-[#db2d8d] transition hover:bg-[#fff0f8]">
                  🚪 Logout
                </button>
              </div>

              {/* Level & Stats (sementara) */}
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

            {/* RIGHT SECTION */}
            <div className="space-y-5">
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
                                  <span className="text-[12px] font-bold bg-[#fff4bf] text-[#9b6b00] px-3 py-1 rounded-full">⚡ +{m.xp}</span>
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

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-[560px] rounded-[24px] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[26px] font-bold text-[#db2d8d]">Edit Profile</h2>
                <p className="mt-1 text-[14px] text-[#777]">Update informasi pribadi kamu</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f7] text-[18px] text-[#555] transition hover:bg-[#efefef]">×</button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <input type="text" name="full_name" placeholder="Nama lengkap" value={editForm.full_name || ""} onChange={handleEditFormChange} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px]" required />
              <input type="text" name="username" placeholder="Username" value={editForm.username || ""} onChange={handleEditFormChange} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px]" required />
              <textarea name="bio" placeholder="Bio singkat tentang dirimu" value={editForm.bio || ""} onChange={handleEditFormChange} className="w-full rounded-[14px] border border-[#e6e6e6] px-4 py-3 text-[14px]" rows={2} />
              <input type="date" name="birth_date" value={editForm.birth_date || ""} onChange={handleEditFormChange} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px]" />
              <select name="gender" value={editForm.gender || ""} onChange={handleEditFormChange} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px]">
                <option value="">Pilih gender</option>
                <option value="Perempuan">Perempuan</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Lainnya">Lainnya</option>
              </select>
              <input type="tel" name="telp_number" placeholder="Nomor telepon" value={editForm.telp_number || ""} onChange={handleEditFormChange} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px]" />
              <input type="text" name="last_edu" placeholder="Pendidikan terakhir" value={editForm.last_edu || ""} onChange={handleEditFormChange} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px]" />
              <input type="text" name="address" placeholder="Alamat" value={editForm.address || ""} onChange={handleEditFormChange} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px]" />
              <input type="text" name="doctor" placeholder="Nama psikiater/konselor" value={editForm.doctor || ""} onChange={handleEditFormChange} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px]" />
              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="rounded-full border border-[#d8d8d8] bg-white px-5 py-2.5 text-[14px] font-medium text-[#555]">Cancel</button>
                <button type="submit" className="rounded-full bg-[#db2d8d] px-5 py-2.5 text-[14px] font-medium text-white">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-[520px] rounded-[24px] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[22px] font-bold text-[#0c72a6]">Ubah Password</h2>
                <p className="mt-1 text-[13px] text-[#777]">Ganti password akun Anda (minimal 8 karakter)</p>
              </div>
              <button onClick={() => setShowPasswordModal(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f7f7f7] text-[16px] text-[#555]">×</button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <input type="password" name="currentPassword" placeholder="Current password" value={passwordForm.currentPassword} onChange={handlePasswordFormChange} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px]" />
              <input type="password" name="newPassword" placeholder="New password" value={passwordForm.newPassword} onChange={handlePasswordFormChange} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px]" />
              <div className="space-y-2">
                <div className="flex justify-between text-[13px] text-[#666]">
                  <span>Password strength</span>
                  <span className="font-semibold text-[#222]">{getPasswordStrength(passwordForm.newPassword).label}</span>
                </div>
                <div className="h-2 rounded-full bg-[#f1f1f1] overflow-hidden">
                  <div className={`${getPasswordStrength(passwordForm.newPassword).color} h-full transition-all`} style={{ width: `${getPasswordStrength(passwordForm.newPassword).percent}%` }} />
                </div>
              </div>
              <input type="password" name="confirmPassword" placeholder="Confirm new password" value={passwordForm.confirmPassword} onChange={handlePasswordFormChange} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px]" />
              <div className="rounded-[16px] bg-[#f7f7f7] p-4 text-[13px] text-[#444]">
                <p className="mb-2 text-[#0c72a6] font-semibold">Lupa password?</p>
                <button type="button" disabled={resetEmailSent} onClick={handleSendPasswordReset} className={`w-full rounded-full px-4 py-2 text-[14px] font-semibold ${resetEmailSent ? "bg-[#d1d5db] text-[#6b7280]" : "bg-[#0c72a6] text-white"}`}>
                  {resetEmailSent ? "Reset email sent" : "Send reset email"}
                </button>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="rounded-full border border-[#d8d8d8] bg-white px-5 py-2.5 text-[14px] font-medium">Cancel</button>
                <button type="submit" className="rounded-full bg-[#db2d8d] px-5 py-2.5 text-[14px] font-medium text-white">Change Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}