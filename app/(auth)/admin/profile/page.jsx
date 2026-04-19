"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

const ADMIN_PROFILE_STORAGE_KEY = "healinq_admin_profile";

const defaultAdminData = {
  name: "Admin HealinQ",
  email: "admin@healinq.com",
  role: "Administrator",
  image: "/images/icon_profile.png",
  lastLogin: "April 19, 2026 - 09:20 AM",
};

function formatTopDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function AdminProfilePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [actionMessage, setActionMessage] = useState("");

  const [adminData, setAdminData] = useState(defaultAdminData);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [editForm, setEditForm] = useState(defaultAdminData);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem(ADMIN_PROFILE_STORAGE_KEY);

      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        const normalizedProfile = {
          ...defaultAdminData,
          ...parsedProfile,
        };
        setAdminData(normalizedProfile);
        setEditForm(normalizedProfile);
      } else {
        localStorage.setItem(
          ADMIN_PROFILE_STORAGE_KEY,
          JSON.stringify(defaultAdminData)
        );
      }
    } catch (error) {
      console.error("Failed to load admin profile:", error);
    }
  }, []);

  useEffect(() => {
    if (!actionMessage) return;

    const timer = setTimeout(() => {
      setActionMessage("");
    }, 2500);

    return () => clearTimeout(timer);
  }, [actionMessage]);

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenEditModal = () => {
    setEditForm(adminData);
    setShowEditModal(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();

    if (!editForm.name.trim() || !editForm.email.trim() || !editForm.role.trim()) {
      setActionMessage("Please complete all profile fields first.");
      return;
    }

    const updatedProfile = {
      ...adminData,
      name: editForm.name.trim(),
      email: editForm.email.trim(),
      role: editForm.role.trim(),
      image: editForm.image.trim() || "/images/icon_profile.png",
    };

    setAdminData(updatedProfile);
    localStorage.setItem(
      ADMIN_PROFILE_STORAGE_KEY,
      JSON.stringify(updatedProfile)
    );

    setShowEditModal(false);
    setActionMessage("Admin profile updated successfully.");
  };

  const handleChangePassword = (e) => {
    e.preventDefault();

    if (
      !passwordForm.currentPassword.trim() ||
      !passwordForm.newPassword.trim() ||
      !passwordForm.confirmPassword.trim()
    ) {
      setActionMessage("Please complete all password fields.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setActionMessage("New password must be at least 6 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setActionMessage("New password and confirmation do not match.");
      return;
    }

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswordModal(false);
    setActionMessage("Password changed successfully. (Demo mode)");
  };

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error("Logout failed:", error);
      window.location.href = "/login";
    }
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
                Admin Profile
              </h1>
              <p className="mt-2 text-[18px] text-[#f08bbf]">
                Manage your admin account information
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
            <div className="rounded-[22px] bg-white/90 p-6 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
              <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
                <div className="flex h-[110px] w-[110px] items-center justify-center rounded-full bg-[#f7d3e4] p-3">
                  <Image
                    src={adminData.image || "/images/icon_profile.png"}
                    alt="Admin Profile"
                    width={90}
                    height={90}
                    className="h-[90px] w-[90px] object-contain"
                  />
                </div>

                <div>
                  <h2 className="text-[28px] font-bold text-[#222]">
                    {adminData.name}
                  </h2>
                  <p className="mt-1 text-[16px] text-[#666]">{adminData.email}</p>
                  <span className="mt-3 inline-flex rounded-full bg-[#ffe7f1] px-4 py-1.5 text-[13px] font-semibold text-[#db2d8d]">
                    {adminData.role}
                  </span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-[16px] bg-[#fff5fa] px-4 py-4">
                  <p className="text-[13px] text-[#ea3f97]">Full Name</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#222]">
                    {adminData.name}
                  </p>
                </div>

                <div className="rounded-[16px] bg-[#f4fbff] px-4 py-4">
                  <p className="text-[13px] text-[#0c72a6]">Email</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#222]">
                    {adminData.email}
                  </p>
                </div>

                <div className="rounded-[16px] bg-[#fff5fa] px-4 py-4">
                  <p className="text-[13px] text-[#ea3f97]">Role</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#222]">
                    {adminData.role}
                  </p>
                </div>

                <div className="rounded-[16px] bg-[#f4fbff] px-4 py-4">
                  <p className="text-[13px] text-[#0c72a6]">Last Login</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#222]">
                    {adminData.lastLogin}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-[20px] bg-[#e7daf0]/85 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                <h2 className="text-[18px] font-bold text-[#1e1e1e]">
                  Account Summary
                </h2>

                <div className="mt-5 space-y-4">
                  <div className="rounded-[14px] bg-white/50 px-4 py-4">
                    <p className="text-[13px] text-[#ea3f97]">Access Level</p>
                    <p className="mt-1 text-[16px] font-semibold text-[#222]">
                      Full Admin Access
                    </p>
                  </div>

                  <div className="rounded-[14px] bg-white/50 px-4 py-4">
                    <p className="text-[13px] text-[#ea3f97]">Managed Modules</p>
                    <p className="mt-1 text-[16px] font-semibold text-[#222]">
                      Users, Counselors, Content, Activity, Transactions
                    </p>
                  </div>

                  <div className="rounded-[14px] bg-white/50 px-4 py-4">
                    <p className="text-[13px] text-[#ea3f97]">Status</p>
                    <p className="mt-1 text-[16px] font-semibold text-[#222]">
                      Active Session
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[20px] bg-[#bde6e5]/85 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                <h2 className="text-[18px] font-bold text-[#1e1e1e]">
                  Quick Actions
                </h2>

                <div className="mt-5 grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={handleOpenEditModal}
                    className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80"
                  >
                    <p className="text-[15px] font-semibold text-[#db2d8d]">
                      Edit Profile
                    </p>
                    <p className="mt-1 text-[12px] text-[#666]">
                      Update admin name, email, role, or image path
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(true)}
                    className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80"
                  >
                    <p className="text-[15px] font-semibold text-[#db2d8d]">
                      Change Password
                    </p>
                    <p className="mt-1 text-[12px] text-[#666]">
                      Open password change form with validation
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80"
                  >
                    <p className="text-[15px] font-semibold text-[#db2d8d]">
                      Logout
                    </p>
                    <p className="mt-1 text-[12px] text-[#666]">
                      End the current admin session
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-[560px] rounded-[24px] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[26px] font-bold text-[#db2d8d]">
                  Edit Admin Profile
                </h2>
                <p className="mt-1 text-[14px] text-[#777]">
                  Update your admin account information
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
                placeholder="Admin name"
                value={editForm.name}
                onChange={handleEditFormChange}
                className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              />

              <input
                type="email"
                name="email"
                placeholder="Admin email"
                value={editForm.email}
                onChange={handleEditFormChange}
                className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              />

              <input
                type="text"
                name="role"
                placeholder="Role"
                value={editForm.role}
                onChange={handleEditFormChange}
                className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              />

              <input
                type="text"
                name="image"
                placeholder="/images/icon_profile.png"
                value={editForm.image}
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
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-[560px] rounded-[24px] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[26px] font-bold text-[#db2d8d]">
                  Change Password
                </h2>
                <p className="mt-1 text-[14px] text-[#777]">
                  Demo version with validation flow
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f7] text-[18px] text-[#555] transition hover:bg-[#efefef]"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <input
                type="password"
                name="currentPassword"
                placeholder="Current password"
                value={passwordForm.currentPassword}
                onChange={handlePasswordFormChange}
                className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              />

              <input
                type="password"
                name="newPassword"
                placeholder="New password"
                value={passwordForm.newPassword}
                onChange={handlePasswordFormChange}
                className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordFormChange}
                className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              />

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="rounded-full border border-[#d8d8d8] bg-white px-5 py-2.5 text-[14px] font-medium text-[#555] transition hover:bg-[#f8f8f8]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-full bg-[#db2d8d] px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#c8277e]"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}