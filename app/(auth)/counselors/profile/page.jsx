"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { supabase } from "@/lib/supabaseClient";

function formatTopDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getStatusClass(status) {
  if (status === "Active") return "bg-[#dff7eb] text-[#1f9d62]";
  if (status === "Inactive") return "bg-[#f3f3f3] text-[#7b7b7b]";
  return "bg-[#fff0d9] text-[#d68a1f]";
}

export default function CounselorProfilePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [actionMessage, setActionMessage] = useState("");
  const [counselorData, setCounselorData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    specialty: "",
    address: "",
    license: "",
    experience: "",
    bio: "",
    image: "/images/icon_profile.png",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchCounselorProfile = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          console.error("No authenticated user");
          // Fallback data dummy
          setCounselorData({
            id: "dummy",
            name: "Counselor",
            email: "counselor@example.com",
            specialty: "General",
            address: "Jakarta",
            status: "Active",
            sessions: 0,
            role: "Counselor",
            image: "/images/icon_profile.png",
            license: "Not set",
            experience: "Not set",
            bio: "No bio available.",
            joined: new Date().toLocaleDateString(),
          });
          setEditForm({
            name: "Counselor",
            email: "counselor@example.com",
            specialty: "General",
            address: "Jakarta",
            license: "Not set",
            experience: "Not set",
            bio: "No bio available.",
            image: "/images/icon_profile.png",
          });
          return;
        }

        // Ambil dari tabel profiles (opsional)
        let profileData = null;
        try {
          const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
          if (data) profileData = data;
        } catch (e) {}

        // Ambil dari tabel counselors
        let counselorDataDB = null;
        try {
          const { data } = await supabase.from("counselors").select("*").eq("id", user.id).single();
          if (data) counselorDataDB = data;
          else {
            const { data: byEmail } = await supabase.from("counselors").select("*").eq("email", user.email).single();
            if (byEmail) counselorDataDB = byEmail;
          }
        } catch (e) {}

        const mergedData = {
          id: user.id,
          name: profileData?.full_name || counselorDataDB?.name || "Counselor",
          email: profileData?.email || user.email || "",
          specialty: counselorDataDB?.specialty || profileData?.specialty || "General",
          address: counselorDataDB?.address || profileData?.address || "Jakarta",
          status: profileData?.status || "Active",
          sessions: profileData?.sessions || 0,
          role: profileData?.role || "Counselor",
          image: counselorDataDB?.image_url || "/images/icon_profile.png",
          license: counselorDataDB?.str_number || "Not set",
          experience: counselorDataDB?.experience || "Not set",
          bio: counselorDataDB?.bio || "No bio available.",
          joined: profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
        };

        setCounselorData(mergedData);
        setEditForm(mergedData);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setActionMessage("Failed to load profile, using default.");
        setCounselorData({
          id: "dummy",
          name: "Counselor",
          email: "counselor@example.com",
          specialty: "General",
          address: "Jakarta",
          status: "Active",
          sessions: 0,
          role: "Counselor",
          image: "/images/icon_profile.png",
          license: "Not set",
          experience: "Not set",
          bio: "No bio available.",
          joined: new Date().toLocaleDateString(),
        });
      }
    };
    fetchCounselorProfile();
  }, []);

  useEffect(() => {
    if (!actionMessage) return;
    const timer = setTimeout(() => setActionMessage(""), 2500);
    return () => clearTimeout(timer);
  }, [actionMessage]);

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenEditModal = () => {
    setEditForm(counselorData);
    setShowEditModal(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.email.trim() || !editForm.specialty.trim()) {
      setActionMessage("Please complete all required fields.");
      return;
    }

    const updated = { ...counselorData, ...editForm };
    try {
      // Update profiles (optional)
      await supabase.from("profiles").update({
        full_name: updated.name,
        email: updated.email,
        specialty: updated.specialty,
        address: updated.address,
      }).eq("id", counselorData.id);

      // Update counselors
      await supabase.from("counselors").update({
        name: updated.name,
        email: updated.email,
        specialty: updated.specialty,
        address: updated.address,
        location: updated.address,
        bio: updated.bio,
        image_url: updated.image,
        str_number: updated.license,
        experience: updated.experience,
      }).eq("id", counselorData.id);

      setCounselorData(updated);
      setShowEditModal(false);
      setActionMessage("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      setActionMessage("Failed to update profile.");
    }
  };

  // ✅ FUNGSI GANTI PASSWORD YANG SUDAH BENAR (menggunakan Supabase Auth)
  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      setActionMessage("Please complete all fields.");
      return;
    }
    if (newPassword.length < 6) {
      setActionMessage("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setActionMessage("Passwords do not match.");
      return;
    }

    try {
      // Gunakan Supabase Auth untuk update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;

      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordModal(false);
      setActionMessage("✅ Password changed successfully!");
    } catch (err) {
      console.error(err);
      setActionMessage("❌ Failed to change password: " + (err.message || "Unknown error"));
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      window.location.href = "/login";
    }
  };

  if (!counselorData) return <div className="flex min-h-screen items-center justify-center">Loading profile...</div>;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#d9edf8]">
      {/* Background decorations – same as original */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-[55%] h-80 w-80 rounded-full bg-[#53bab3b2] blur-[100px]" />
        <div className="absolute right-[8%] top-[-8rem] h-80 w-80 rounded-full bg-[#53bab3b2] blur-[100px]" />
        <div className="absolute left-[14%] top-[-7rem] h-72 w-72 rounded-full bg-[#ffe5f3cc] blur-[100px]" />
        <div className="absolute right-[20%] top-[16%] h-72 w-72 rounded-full bg-[#ffe5f3cc] blur-[100px]" />
        <div className="absolute bottom-[-9rem] left-[-2rem] h-80 w-80 rounded-full bg-[#ffe5f3cc] blur-[100px]" />
        <div className="absolute bottom-[-5rem] left-[26%] h-72 w-72 rounded-full bg-[#9ad9f8cc] blur-[100px]" />
        <div className="absolute left-[-6rem] top-[-3rem] h-72 w-72 rounded-full bg-[#9ad9f8cc] blur-[100px]" />
        <Image src="/images/header.png" alt="Header Decoration" width={1600} height={200} className="absolute top-0 left-0 w-full object-cover opacity-80" />
      </div>

      <section className="relative z-10 w-full px-6 pb-6 pt-40 sm:px-8 lg:px-12">
        <div className="relative">
          <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-[34px] font-bold leading-none text-[#e1268d] sm:text-[42px]">Counselor Profile</h1>
              <p className="mt-2 text-[18px] text-[#f08bbf]">Manage your professional information</p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="w-fit rounded-full bg-white px-5 py-2 text-[15px] font-medium text-[#e85fa7] shadow-sm">{formatTopDate(currentDate)}</div>
              {actionMessage && <div className="rounded-full bg-white/90 px-4 py-2 text-[13px] font-medium text-[#db2d8d] shadow-sm">{actionMessage}</div>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            {/* Left card */}
            <div className="rounded-[22px] bg-white/90 p-6 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
              <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
                <div className="flex h-[110px] w-[110px] items-center justify-center rounded-full bg-[#f7d3e4] p-3">
                  <Image src={counselorData.image || "/images/icon_profile.png"} alt="Profile" width={90} height={90} className="h-[90px] w-[90px] object-contain" />
                </div>
                <div>
                  <h2 className="text-[28px] font-bold text-[#222]">{counselorData.name}</h2>
                  <p className="mt-1 text-[16px] text-[#666]">{counselorData.email}</p>
                  <span className={`mt-3 inline-flex rounded-full px-4 py-1.5 text-[13px] font-semibold ${getStatusClass(counselorData.status)}`}>{counselorData.status}</span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-[16px] bg-[#fff5fa] px-4 py-4"><p className="text-[13px] text-[#ea3f97]">Full Name</p><p className="mt-1 text-[16px] font-semibold text-[#222]">{counselorData.name}</p></div>
                <div className="rounded-[16px] bg-[#f4fbff] px-4 py-4"><p className="text-[13px] text-[#0c72a6]">Email</p><p className="mt-1 text-[16px] font-semibold text-[#222]">{counselorData.email}</p></div>
                <div className="rounded-[16px] bg-[#fff5fa] px-4 py-4"><p className="text-[13px] text-[#ea3f97]">Specialty</p><p className="mt-1 text-[16px] font-semibold text-[#222]">{counselorData.specialty}</p></div>
                <div className="rounded-[16px] bg-[#f4fbff] px-4 py-4"><p className="text-[13px] text-[#0c72a6]">License</p><p className="mt-1 text-[16px] font-semibold text-[#222]">{counselorData.license}</p></div>
                <div className="rounded-[16px] bg-[#fff5fa] px-4 py-4"><p className="text-[13px] text-[#ea3f97]">Location</p><p className="mt-1 text-[16px] font-semibold text-[#222]">{counselorData.address}</p></div>
                <div className="rounded-[16px] bg-[#f4fbff] px-4 py-4"><p className="text-[13px] text-[#0c72a6]">Experience</p><p className="mt-1 text-[16px] font-semibold text-[#222]">{counselorData.experience}</p></div>
              </div>
              <div className="mt-4 rounded-[16px] bg-[#f4fbff] px-4 py-4"><p className="text-[13px] text-[#0c72a6]">Bio</p><p className="mt-1 text-[16px] text-[#222]">{counselorData.bio}</p></div>
            </div>

            {/* Right panel */}
            <div className="space-y-5">
              <div className="rounded-[20px] bg-[#e7daf0]/85 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                <h2 className="text-[18px] font-bold text-[#1e1e1e]">Summary</h2>
                <div className="mt-5 space-y-4">
                  <div className="rounded-[14px] bg-white/50 px-4 py-4"><p className="text-[13px] text-[#ea3f97]">Total Sessions</p><p className="mt-1 text-[16px] font-semibold text-[#222]">{counselorData.sessions} consultations</p></div>
                  <div className="rounded-[14px] bg-white/50 px-4 py-4"><p className="text-[13px] text-[#ea3f97]">Joined Date</p><p className="mt-1 text-[16px] font-semibold text-[#222]">{counselorData.joined}</p></div>
                  <div className="rounded-[14px] bg-white/50 px-4 py-4"><p className="text-[13px] text-[#ea3f97]">Current Status</p><p className="mt-1 text-[16px] font-semibold text-[#222]">{counselorData.status}</p></div>
                </div>
              </div>

              <div className="rounded-[20px] bg-[#bde6e5]/85 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                <h2 className="text-[18px] font-bold text-[#1e1e1e]">Quick Actions</h2>
                <div className="mt-5 grid grid-cols-1 gap-3">
                  <button onClick={handleOpenEditModal} className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80"><p className="text-[15px] font-semibold text-[#db2d8d]">Edit Profile</p><p className="mt-1 text-[12px] text-[#666]">Update information</p></button>
                  <button onClick={() => setShowPasswordModal(true)} className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80"><p className="text-[15px] font-semibold text-[#db2d8d]">Change Password</p><p className="mt-1 text-[12px] text-[#666]">Update password</p></button>
                  <button onClick={handleLogout} className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80"><p className="text-[15px] font-semibold text-[#db2d8d]">Logout</p><p className="mt-1 text-[12px] text-[#666]">End session</p></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Edit Profile Modal (sama) */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-[560px] rounded-[24px] bg-white p-6 shadow-lg">
            <div className="mb-5 flex justify-between items-center">
              <div><h2 className="text-[26px] font-bold text-[#db2d8d]">Edit Profile</h2><p className="text-sm text-gray-500">Update your information</p></div>
              <button onClick={() => setShowEditModal(false)} className="text-3xl leading-none text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <input name="name" value={editForm.name} onChange={handleEditFormChange} className="w-full rounded-xl border p-3" placeholder="Full name" required />
              <input name="email" value={editForm.email} onChange={handleEditFormChange} className="w-full rounded-xl border p-3 bg-gray-50" placeholder="Email" readOnly />
              <input name="specialty" value={editForm.specialty} onChange={handleEditFormChange} className="w-full rounded-xl border p-3" placeholder="Specialty" required />
              <input name="address" value={editForm.address} onChange={handleEditFormChange} className="w-full rounded-xl border p-3" placeholder="Location" />
              <input name="license" value={editForm.license} onChange={handleEditFormChange} className="w-full rounded-xl border p-3" placeholder="License number" />
              <input name="experience" value={editForm.experience} onChange={handleEditFormChange} className="w-full rounded-xl border p-3" placeholder="Experience (e.g., 5 years)" />
              <textarea name="bio" value={editForm.bio} onChange={handleEditFormChange} className="w-full rounded-xl border p-3" placeholder="Bio" rows={3} />
              <input name="image" value={editForm.image} onChange={handleEditFormChange} className="w-full rounded-xl border p-3" placeholder="Image URL" />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-5 py-2 rounded-full border">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-full bg-[#db2d8d] text-white">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal (dengan fungsi baru) */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-[560px] rounded-[24px] bg-white p-6 shadow-lg">
            <div className="mb-5 flex justify-between items-center">
              <div><h2 className="text-[26px] font-bold text-[#db2d8d]">Change Password</h2><p className="text-sm text-gray-500">Update your password</p></div>
              <button onClick={() => setShowPasswordModal(false)} className="text-3xl leading-none text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <input type="password" name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordFormChange} className="w-full rounded-xl border p-3" placeholder="Current password" required />
              <input type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordFormChange} className="w-full rounded-xl border p-3" placeholder="New password (min 6 chars)" required />
              <input type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordFormChange} className="w-full rounded-xl border p-3" placeholder="Confirm new password" required />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="px-5 py-2 rounded-full border">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-full bg-[#db2d8d] text-white">Change</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}