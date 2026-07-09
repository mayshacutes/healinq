"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logActivity } from "@/lib/activityLogger";
import { supabase } from "@/lib/supabaseClient";
import { Icon } from "@iconify/react";



function formatTopDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function UserProfilePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [actionMessage, setActionMessage] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [consultationHistory, setConsultationHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
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
    avatar_url: "",
  });

  const [editForm, setEditForm] = useState(profile);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
            avatar_url: "",
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
    async function fetchConsultations() {
      setLoadingHistory(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoadingHistory(false); return; }

      const { data } = await supabase
        .from("consultations")
        .select("id, counselor_name, consultation_type, consultation_date, consultation_hour, topic, status, session_duration, created_at")
        .eq("client_id", user.id)
        .order("consultation_date", { ascending: false });

      setConsultationHistory(data || []);
      setLoadingHistory(false);
    }
    fetchConsultations();
  }, []);

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
    setAvatarFile(null);
    setAvatarPreview(profile.avatar_url || "");
    setShowEditModal(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setActionMessage("File harus berupa gambar.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setActionMessage("Ukuran gambar maksimal 2MB.");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
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

    const cleanUsername = editForm.username.trim();
    const cleanFullName = editForm.full_name.trim();

    const { data: existingUsername, error: usernameCheckError } = await supabase
      .from("profiles")
      .select("id")
      .ilike("username", cleanUsername)
      .neq("id", user.id)
      .maybeSingle();

    if (usernameCheckError) {
      console.error(usernameCheckError);
      setActionMessage("Gagal mengecek username.");
      return;
    }

    if (existingUsername) {
      setActionMessage("Username sudah digunakan. Silakan pilih username lain.");
      return;
    }

    let avatarUrl = editForm.avatar_url || "";

    if (avatarFile) {
      setUploadingAvatar(true);

      const fileExt = avatarFile.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-pictures")
        .upload(filePath, avatarFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error(uploadError);
        setUploadingAvatar(false);
        setActionMessage("Gagal upload foto profile.");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("profile-pictures")
        .getPublicUrl(filePath);

      avatarUrl = publicUrlData.publicUrl;
      setUploadingAvatar(false);
    }

    const updatedProfile = {
      ...editForm,
      full_name: cleanFullName,
      username: cleanUsername,
      bio: editForm.bio,
      telp_number: editForm.telp_number,
      birth_date: editForm.birth_date,
      gender: editForm.gender,
      address: editForm.address,
      last_edu: editForm.last_edu,
      doctor: editForm.doctor,
      avatar_url: avatarUrl,
    };

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: updatedProfile.full_name,
        username: updatedProfile.username,
        bio: updatedProfile.bio,
        telp_number: updatedProfile.telp_number,
        birth_date: updatedProfile.birth_date,
        gender: updatedProfile.gender,
        address: updatedProfile.address,
        last_edu: updatedProfile.last_edu,
        doctor: updatedProfile.doctor,
        avatar_url: updatedProfile.avatar_url,
      })
      .eq("id", user.id);

    if (error) {
      console.error(error);
      setActionMessage("Gagal menyimpan perubahan.");
    } else {
      setProfile(updatedProfile);
      setEditForm(updatedProfile);
      setAvatarFile(null);
      setAvatarPreview("");
      setShowEditModal(false);
      setActionMessage("Profil berhasil diperbarui!");
    }
  };

  const handleLogout = async () => {

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await logActivity({
        actor_id: user.id,

        actor_name:
          profile.full_name ||
          profile.username ||
          user.email,

        actor_role: "User",

        action: "Logged out of account",

        category: "Authentication",

        status: "Completed",

        description:
          "User logged out from HealinQ.",
      });
    }

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
                  <div className="h-[110px] w-[110px] overflow-hidden rounded-full bg-[#f7d3e4]">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Icon icon="solar:user-circle-bold" className="text-[78px] text-[#db2d8d]" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-[28px] font-bold text-[#222]">{profile.full_name || profile.username}</h2>
                    <p className="mt-1 text-[16px] text-[#666]">@{profile.username}</p>
                    <p className="mt-2 text-[14px] text-[#888]">{profile.bio}</p>
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-[16px] bg-[#fff5fa] px-4 py-4">
                    <p className="flex items-center gap-2 text-[13px] text-[#ea3f97]">
                      <Icon icon="solar:map-point-bold" className="text-[16px]" />
                      Lokasi
                    </p>
                    <p className="mt-1 text-[16px] font-semibold text-[#222]">{profile.address}</p>
                  </div>
                  <div className="rounded-[16px] bg-[#f4fbff] px-4 py-4">
                    <p className="flex items-center gap-2 text-[13px] text-[#0c72a6]">
                      <Icon icon="solar:calendar-date-bold" className="text-[16px]" />
                      Usia
                    </p>
                    <p className="mt-1 text-[16px] font-semibold text-[#222]">{calcAge(profile.birth_date)}</p>
                  </div>
                  <div className="rounded-[16px] bg-[#fff5fa] px-4 py-4">
                    <p className="flex items-center gap-2 text-[13px] text-[#ea3f97]">
                      <Icon icon="solar:user-rounded-bold" className="text-[16px]" />
                      Jenis Kelamin
                    </p>
                    <p className="mt-1 text-[16px] font-semibold text-[#222]">{profile.gender}</p>
                  </div>
                  <div className="rounded-[16px] bg-[#f4fbff] px-4 py-4">
                    <p className="flex items-center gap-2 text-[13px] text-[#0c72a6]">
                      <Icon icon="solar:square-academic-cap-bold" className="text-[16px]" />
                      Pendidikan
                    </p>
                    <p className="mt-1 text-[16px] font-semibold text-[#222]">{profile.last_edu}</p>
                  </div>
                  <div className="rounded-[16px] bg-[#fff5fa] px-4 py-4">
                    <p className="flex items-center gap-2 text-[13px] text-[#ea3f97]">
                      <Icon icon="solar:phone-bold" className="text-[16px]" />
                      Telepon
                    </p>
                    <p className="mt-1 text-[16px] font-semibold text-[#222]">{profile.telp_number}</p>
                  </div>
                  <div className="rounded-[16px] bg-[#f4fbff] px-4 py-4">
                    <p className="flex items-center gap-2 text-[13px] text-[#0c72a6]">
                      <Icon icon="solar:health-bold" className="text-[16px]" />
                      Psikiater
                    </p>
                    <p className="mt-1 text-[16px] font-semibold text-[#222]">{profile.doctor}</p>
                  </div>
                </div>
                <button onClick={handleOpenEditModal} className="mt-6 w-full rounded-full bg-[#db2d8d] px-5 py-3 text-[14px] font-bold text-white transition hover:bg-[#c8277e]">
                  <span className="flex items-center justify-center gap-2">
                    <Icon icon="solar:pen-bold" className="text-[17px]" />
                    Edit Profile
                  </span>
                </button>
                <button onClick={() => setShowPasswordModal(true)} className="mt-3 w-full rounded-full bg-[#f28a50] px-5 py-3 text-[14px] font-bold text-white transition hover:bg-[#d76a44]">
                  <span className="flex items-center justify-center gap-2">
                    <Icon icon="solar:key-bold" className="text-[17px]" />
                    Ubah Password
                  </span>
                </button>
                <button onClick={handleLogout} className="mt-3 w-full rounded-full border border-[#db2d8d] bg-white px-5 py-3 text-[14px] font-bold text-[#db2d8d] transition hover:bg-[#fff0f8]">
                  <span className="flex items-center justify-center gap-2">
                    <Icon icon="solar:logout-2-bold" className="text-[17px]" />
                    Logout
                  </span>
                </button>
              </div>
            </div>

            {/* RIGHT SECTION */}
            <div className="space-y-5">
              <h2 className="flex items-center gap-2 text-[18px] font-bold text-[#0c72a6]">
                <Icon icon="solar:clipboard-list-bold" className="text-[20px]" />
                Riwayat Konsultasi
              </h2>
              <div className="space-y-3">
                {loadingHistory ? (
                  <div className="text-center text-gray-400 py-8 text-sm">Memuat riwayat...</div>
                ) : consultationHistory.length === 0 ? (
                  <div className="text-center text-gray-400 py-8 text-sm">Belum ada riwayat konsultasi.</div>
                ) : (
                  consultationHistory.map((c) => {
                    const date = new Date(c.consultation_date);
                    const day = date.getDate();
                    const month = date.toLocaleString("en-US", { month: "long" });
                    const timeStr = `${c.consultation_hour?.replace(".", ":")} • ${c.session_duration || 60} menit`;
                    const sessionStart = new Date(`${c.consultation_date}T${c.consultation_hour?.replace(".", ":")}:00`);
                    const sessionEnd = new Date(sessionStart.getTime() + (c.session_duration || 60) * 60000);
                    const now = new Date();
                    let statusLabel, statusClass;
                    if (c.status === "cancelled") {
                      statusLabel = "Cancelled";
                      statusClass = "bg-[#f3f3f3] text-[#7b7b7b]";
                    } else if (now < sessionStart) {
                      statusLabel = "Akan Datang";
                      statusClass = "bg-blue-100 text-blue-600";
                    } else if (now >= sessionStart && now <= sessionEnd) {
                      statusLabel = "Berlangsung";
                      statusClass = "bg-green-100 text-green-600";
                    } else {
                      statusLabel = "Selesai";
                      statusClass = "bg-[#dff7eb] text-[#1f9d62]";
                    }
                    return (
                      <div key={c.id} className="rounded-[16px] bg-white/90 p-4 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.12)] transition border-l-[4px] border-[#8fd0ef]">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[20px] font-bold text-[#ea1e8c]">{day}</span>
                              <span className="text-[13px] font-bold text-[#0c72a6]">{month}</span>
                            </div>
                            <p className="flex items-center gap-2 text-[14px] font-bold text-[#222]">
                              <Icon icon="solar:health-bold" className="text-[15px]" />
                              {c.counselor_name}
                            </p>
                            <p className="mt-1 flex items-center gap-2 text-[12px] text-[#666]">
                              <Icon icon="solar:clock-circle-bold" className="text-[14px]" />
                              {timeStr}
                            </p>
                            <div className="flex gap-2 mt-3">
                              <span className={`flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full ${c.consultation_type === "online" ? "bg-[#dff4ff] text-[#0c72a6]" : "bg-[#fde8f3] text-[#db2d8d]"}`}>
                                {c.consultation_type === "online" ? (
                                  <>
                                    <Icon icon="solar:monitor-bold" className="text-[13px]" />
                                    Online
                                  </>
                                ) : (
                                  <>
                                    <Icon icon="solar:hospital-bold" className="text-[13px]" />
                                    Offline
                                  </>
                                )}
                              </span>
                              <span className={`flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full ${statusClass}`}>
                                {c.status === "cancelled" ? (
                                  <Icon icon="solar:close-circle-bold" className="text-[13px]" />
                                ) : now < sessionStart ? (
                                  <Icon icon="solar:calendar-bold" className="text-[13px]" />
                                ) : now >= sessionStart && now <= sessionEnd ? (
                                  <Icon icon="solar:chat-round-dots-bold" className="text-[13px]" />
                                ) : (
                                  <Icon icon="solar:check-circle-bold" className="text-[13px]" />
                                )}
                                {statusLabel}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/25 px-4 py-8">
          <div className="mx-auto w-full max-w-[560px] rounded-[24px] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[26px] font-bold text-[#db2d8d]">Edit Profile</h2>
                <p className="mt-1 text-[14px] text-[#777]">Update informasi pribadi kamu</p>
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
              <div className="flex flex-col items-center gap-3">
                <div className="h-[110px] w-[110px] overflow-hidden rounded-full bg-[#f7d3e4]">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-[70px]">🐰</span>
                    </div>
                  )}
                </div>

                <label className="cursor-pointer rounded-full bg-[#0c72a6] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#0a5f8a]">
                  Upload Foto Profile
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>

                <p className="text-[12px] text-[#777]">
                  Format gambar, maksimal 2MB
                </p>
              </div>
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
                <button
                  type="submit"
                  disabled={uploadingAvatar}
                  className="rounded-full bg-[#db2d8d] px-5 py-2.5 text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploadingAvatar ? "Uploading..." : "Save Changes"}
                </button>
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