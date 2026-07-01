"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function formatTopDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(date);
}

export default function CounselorProfilePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [actionMessage, setActionMessage] = useState("");
  const [counselorData, setCounselorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!actionMessage) return;
    const timer = setTimeout(() => setActionMessage(""), 2500);
    return () => clearTimeout(timer);
  }, [actionMessage]);

  // AMBIL DATA KONSELOR DARI SUPABASE
  useEffect(() => {
    const fetchCounselor = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoading(false); return; }

      const { data, error } = await supabase
        .from("counselors")
        .select("*")
        .eq("email", user.email)
        .maybeSingle();

      if (error || !data) {
        setActionMessage("Gagal memuat profil konselor.");
        setIsLoading(false);
        return;
      }

      setCounselorData(data);
      setEditForm(data);
      setIsLoading(false);
    };
    fetchCounselor();
  }, []);

  const handleEditFormChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // SIMPAN EDIT PROFIL KE SUPABASE
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editForm.name?.trim()) {
      setActionMessage("Nama tidak boleh kosong.");
      return;
    }

    const { error } = await supabase
      .from("counselors")
      .update({
        name: editForm.name.trim(),
        specialty: editForm.specialty?.trim() || null,
        address: editForm.address?.trim() || null,
        bio: editForm.bio?.trim() || null,
      })
      .eq("id", counselorData.id);

    if (error) {
      setActionMessage("Gagal menyimpan profil: " + error.message);
      return;
    }

    setCounselorData((prev) => ({ ...prev, ...editForm }));
    setShowEditModal(false);
    setActionMessage("✅ Profil berhasil diperbarui.");
  };

  // GANTI PASSWORD VIA SUPABASE AUTH
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      setActionMessage("Password minimal 6 karakter.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setActionMessage("Konfirmasi password tidak cocok.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: passwordForm.newPassword,
    });

    if (error) {
      setActionMessage("Gagal ganti password: " + error.message);
      return;
    }

    setPasswordForm({ newPassword: "", confirmPassword: "" });
    setShowPasswordModal(false);
    setActionMessage("✅ Password berhasil diubah.");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#d9edf8] flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#db2d8d] border-t-transparent"></div>
      </main>
    );
  }

  if (!counselorData) {
    return (
      <main className="min-h-screen bg-[#d9edf8] flex items-center justify-center">
        <div className="text-center text-gray-500">Data konselor tidak ditemukan.</div>
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
        <Image src="/images/header.png" alt="Header" width={1600} height={200}
          className="absolute top-0 left-0 w-full object-cover opacity-80" />
      </div>

      <section className="relative z-10 w-full px-6 pb-6 pt-40 sm:px-8 lg:px-12">
        {actionMessage && (
          <div className="mb-4 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-[#db2d8d] shadow w-fit">
            {actionMessage}
          </div>
        )}

        <div className="mb-4 text-sm text-[#0c72a6]">{formatTopDate(currentDate)}</div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* KARTU PROFIL */}
          <div className="rounded-[24px] bg-white/70 p-6 shadow flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
              <Image src={counselorData.photo_url || "/images/icon_profile.png"}
                alt="profile" width={96} height={96} className="object-cover" />
            </div>
            <h2 className="text-xl font-bold text-[#db2d8d] text-center">{counselorData.name}</h2>
            <p className="text-sm text-gray-500">{counselorData.email}</p>
            <span className="rounded-full bg-[#dff7eb] px-3 py-1 text-sm text-[#1f9d62] font-medium">
              {counselorData.status || "Active"}
            </span>
            <div className="w-full mt-2 text-sm space-y-2 text-gray-600">
              <p><b>Specialty:</b> {counselorData.specialty || "-"}</p>
              <p><b>Alamat:</b> {counselorData.address || "-"}</p>
              <p><b>Sessions:</b> {counselorData.sessions || 0}</p>
              <p><b>Bio:</b> {counselorData.bio || "-"}</p>
            </div>
            <button onClick={() => { setEditForm(counselorData); setShowEditModal(true); }}
              className="mt-3 w-full rounded-full bg-[#db2d8d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c8277e]">
              Edit Profile
            </button>
          </div>

          {/* MENU */}
          <div className="lg:col-span-2 rounded-[24px] bg-white/70 p-6 shadow space-y-3">
            <h3 className="text-lg font-bold text-[#0c72a6] mb-4">Account Settings</h3>
            <button onClick={() => setShowPasswordModal(true)}
              className="w-full rounded-[14px] bg-white/60 px-4 py-4 text-left hover:bg-white/80">
              <p className="font-semibold text-[#db2d8d]">Change Password</p>
              <p className="text-xs text-[#666] mt-1">Update your account password</p>
            </button>
            <button onClick={handleLogout}
              className="w-full rounded-[14px] bg-white/60 px-4 py-4 text-left hover:bg-white/80">
              <p className="font-semibold text-[#db2d8d]">Logout</p>
              <p className="text-xs text-[#666] mt-1">End the current session</p>
            </button>
          </div>
        </div>
      </section>

      {/* MODAL EDIT */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-[520px] rounded-[24px] bg-white p-6 shadow-xl">
            <div className="mb-5 flex justify-between items-start">
              <h2 className="text-2xl font-bold text-[#db2d8d]">Edit Profile</h2>
              <button onClick={() => setShowEditModal(false)}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">×</button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-3">
              {[
                { name: "name", placeholder: "Nama lengkap" },
                { name: "specialty", placeholder: "Specialty (misal: Anxiety, Depression)" },
                { name: "address", placeholder: "Alamat / Lokasi" },
              ].map((f) => (
                <input key={f.name} type="text" name={f.name} placeholder={f.placeholder}
                  value={editForm[f.name] || ""}
                  onChange={handleEditFormChange}
                  className="h-12 w-full rounded-[14px] border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200" />
              ))}
              <textarea name="bio" placeholder="Bio profesional" rows={3}
                value={editForm.bio || ""} onChange={handleEditFormChange}
                className="w-full rounded-[14px] border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200" />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)}
                  className="rounded-full border border-gray-200 px-5 py-2 text-sm text-gray-500">Cancel</button>
                <button type="submit"
                  className="rounded-full bg-[#db2d8d] px-5 py-2 text-sm font-medium text-white">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GANTI PASSWORD */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-[520px] rounded-[24px] bg-white p-6 shadow-xl">
            <div className="mb-5 flex justify-between items-start">
              <h2 className="text-2xl font-bold text-[#db2d8d]">Change Password</h2>
              <button onClick={() => setShowPasswordModal(false)}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">×</button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <input type="password" placeholder="Password baru" value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                className="h-12 w-full rounded-[14px] border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200" />
              <input type="password" placeholder="Konfirmasi password baru" value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                className="h-12 w-full rounded-[14px] border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200" />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowPasswordModal(false)}
                  className="rounded-full border border-gray-200 px-5 py-2 text-sm text-gray-500">Cancel</button>
                <button type="submit"
                  className="rounded-full bg-[#db2d8d] px-5 py-2 text-sm font-medium text-white">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}