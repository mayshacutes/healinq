"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { supabase } from "@/lib/supabaseClient";

// const COUNSELOR_PROFILE_STORAGE_KEY = "healinq_counselor_profile";

// const defaultCounselorData = {
//   id: 1,
//   name: "Dr. Aulia Rahman",
//   email: "aulia@healinq.com",
//   specialty: "Anxiety",
//   address: "Jakarta, Indonesia",
//   joined: "Mar 28, 2026",
//   status: "Active",
//   sessions: 128,
//   role: "Counselor",
//   image: "/images/icon_profile.png",
//   license: "PSY-2024-001",
//   experience: "8 years",
//   bio: "Specialized in anxiety disorders and stress management with evidence-based therapeutic approaches.",
// };

function formatTopDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getStatusClass(status) {
  if (status === "Active") {
    return "bg-[#dff7eb] text-[#1f9d62]";
  }
  if (status === "Inactive") {
    return "bg-[#f3f3f3] text-[#7b7b7b]";
  }
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
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // useEffect(() => {
  //   try {
  //     const storedProfile = localStorage.getItem(COUNSELOR_PROFILE_STORAGE_KEY);

  //     if (storedProfile) {
  //       const parsedProfile = JSON.parse(storedProfile);
  //       const normalizedProfile = {
  //         ...defaultCounselorData,
  //         ...parsedProfile,
  //       };
  //       setCounselorData(normalizedProfile);
  //       setEditForm(normalizedProfile);
  //     } else {
  //       localStorage.setItem(
  //         COUNSELOR_PROFILE_STORAGE_KEY,
  //         JSON.stringify(defaultCounselorData)
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Failed to load counselor profile:", error);
  //   }
  // }, []);

  useEffect(() => {

    const fetchCounselorProfile = async () => {

      try {

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          console.error("No authenticated counselor");
          return;
        }

        // ambil profile
        const { data: profileData, error: profileError } =
          await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        // ambil counselor detail
        const { data: counselorDataDB, error: counselorError } =
          await supabase
            .from("counselors")
            .select("*")
            .eq("id", user.id)
            .single();

        if (profileError || counselorError) {
          console.error(profileError || counselorError);
          return;
        }

        const mergedData = {
          id: user.id,
          name:
            profileData.full_name ||
            counselorDataDB.name ||
            "Counselor",
          email: profileData.email || "",
          specialty:
            counselorDataDB.specialty ||
            profileData.specialty ||
            "",
          address:
            counselorDataDB.address ||
            profileData.address ||
            "",
          status: profileData.status || "Active",
          sessions: profileData.sessions || 0,
          role: profileData.role || "Counselor",
          image:
            counselorDataDB.image_url ||
            "/images/icon_profile.png",
          license:
            counselorDataDB.str_number ||
            "No license",
          experience: "Professional Counselor",
          bio:
            counselorDataDB.bio ||
            "No bio available.",
          joined: new Date(
            profileData.created_at
          ).toLocaleDateString(),
        };

        setCounselorData(mergedData);
        setEditForm(mergedData);

      } catch (error) {
        console.error(error);
      }
    };

    fetchCounselorProfile();

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
    setEditForm(counselorData);
    setShowEditModal(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (
      !editForm.name.trim() ||
      !editForm.email.trim() ||
      !editForm.specialty.trim()
    ) {
      setActionMessage("Please complete all required profile fields.");
      return;
    }

    const updatedProfile = {
      ...counselorData,
      name: editForm.name.trim(),
      email: editForm.email.trim(),
      specialty: editForm.specialty.trim(),
      address: editForm.address.trim(),
      license: editForm.license.trim(),
      experience: editForm.experience.trim(),
      bio: editForm.bio.trim(),
      image: editForm.image.trim(),
    };

    try {

      // update profiles
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: updatedProfile.name,
          email: updatedProfile.email,
          specialty: updatedProfile.specialty,
          address: updatedProfile.address,
        })
        .eq("id", counselorData.id);

      // update counselors
      const { error: counselorError } = await supabase
        .from("counselors")
        .update({
          name: updatedProfile.name,
          email: updatedProfile.email,
          specialty: updatedProfile.specialty,
          specialization: updatedProfile.specialty,
          address: updatedProfile.address,
          location: updatedProfile.address,
          bio: updatedProfile.bio,
          image_url: updatedProfile.image,
          str_number: updatedProfile.license,
        })
        .eq("id", counselorData.id);

      if (profileError || counselorError) {
        console.error(profileError || counselorError);

        setActionMessage("Failed to update profile.");
        return;
      }

      setCounselorData(updatedProfile);

      setShowEditModal(false);

      setActionMessage(
        "Profile updated successfully."
      );

    } catch (error) {

      console.error(error);

      setActionMessage(
        "Unexpected error occurred."
      );
    }

    // setCounselorData(updatedProfile);
    // localStorage.setItem(
    //   COUNSELOR_PROFILE_STORAGE_KEY,
    //   JSON.stringify(updatedProfile)
    // );

    setShowEditModal(false);
    setActionMessage("Profile updated successfully.");
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

  if (!counselorData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading profile...
      </div>
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
              <h1 className="text-[34px] font-bold leading-none text-[#e1268d] sm:text-[42px]">
                Counselor Profile
              </h1>
              <p className="mt-2 text-[18px] text-[#f08bbf]">
                Manage your professional information
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
                    src={counselorData.image || "/images/icon_profile.png"}
                    alt="Counselor Profile"
                    width={90}
                    height={90}
                    className="h-[90px] w-[90px] object-contain"
                  />
                </div>

                <div>
                  <h2 className="text-[28px] font-bold text-[#222]">
                    {counselorData.name}
                  </h2>
                  <p className="mt-1 text-[16px] text-[#666]">
                    {counselorData.email}
                  </p>
                  <span
                    className={`mt-3 inline-flex rounded-full px-4 py-1.5 text-[13px] font-semibold ${getStatusClass(
                      counselorData.status
                    )}`}
                  >
                    {counselorData.status}
                  </span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-[16px] bg-[#fff5fa] px-4 py-4">
                  <p className="text-[13px] text-[#ea3f97]">Full Name</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#222]">
                    {counselorData.name}
                  </p>
                </div>

                <div className="rounded-[16px] bg-[#f4fbff] px-4 py-4">
                  <p className="text-[13px] text-[#0c72a6]">Email</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#222]">
                    {counselorData.email}
                  </p>
                </div>

                <div className="rounded-[16px] bg-[#fff5fa] px-4 py-4">
                  <p className="text-[13px] text-[#ea3f97]">Specialty</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#222]">
                    {counselorData.specialty}
                  </p>
                </div>

                <div className="rounded-[16px] bg-[#f4fbff] px-4 py-4">
                  <p className="text-[13px] text-[#0c72a6]">License</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#222]">
                    {counselorData.license}
                  </p>
                </div>

                <div className="rounded-[16px] bg-[#fff5fa] px-4 py-4">
                  <p className="text-[13px] text-[#ea3f97]">Location</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#222]">
                    {counselorData.address}
                  </p>
                </div>

                <div className="rounded-[16px] bg-[#f4fbff] px-4 py-4">
                  <p className="text-[13px] text-[#0c72a6]">Experience</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#222]">
                    {counselorData.experience}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-[16px] bg-[#f4fbff] px-4 py-4">
                <p className="text-[13px] text-[#0c72a6]">Bio</p>
                <p className="mt-1 text-[16px] text-[#222]">
                  {counselorData.bio}
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-[20px] bg-[#e7daf0]/85 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                <h2 className="text-[18px] font-bold text-[#1e1e1e]">
                  Summary
                </h2>

                <div className="mt-5 space-y-4">
                  <div className="rounded-[14px] bg-white/50 px-4 py-4">
                    <p className="text-[13px] text-[#ea3f97]">Total Sessions</p>
                    <p className="mt-1 text-[16px] font-semibold text-[#222]">
                      {counselorData.sessions} consultations
                    </p>
                  </div>

                  <div className="rounded-[14px] bg-white/50 px-4 py-4">
                    <p className="text-[13px] text-[#ea3f97]">Joined Date</p>
                    <p className="mt-1 text-[16px] font-semibold text-[#222]">
                      {counselorData.joined}
                    </p>
                  </div>

                  <div className="rounded-[14px] bg-white/50 px-4 py-4">
                    <p className="text-[13px] text-[#ea3f97]">Current Status</p>
                    <p className="mt-1 text-[16px] font-semibold text-[#222]">
                      {counselorData.status}
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
                      Update professional information
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
                      Update your account password
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
                      End the current session
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
                  Edit Profile
                </h2>
                <p className="mt-1 text-[14px] text-[#777]">
                  Update your professional information
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
                placeholder="Full name"
                value={editForm.name}
                onChange={handleEditFormChange}
                className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              />

              <input
                type="email"
                readOnly
                name="email"
                placeholder="Email address"
                value={editForm.email}
                onChange={handleEditFormChange}
                className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              />

              <input
                type="text"
                name="specialty"
                placeholder="Specialty (e.g., Anxiety, Depression)"
                value={editForm.specialty}
                onChange={handleEditFormChange}
                className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              />

              <input
                type="text"
                name="address"
                placeholder="Location"
                value={editForm.address}
                onChange={handleEditFormChange}
                className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              />

              <input
                type="text"
                name="license"
                placeholder="License number"
                value={editForm.license}
                onChange={handleEditFormChange}
                className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              />

              <input
                type="text"
                name="experience"
                placeholder="Years of experience"
                value={editForm.experience}
                onChange={handleEditFormChange}
                className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              />

              <textarea
                name="bio"
                placeholder="Professional bio"
                value={editForm.bio}
                onChange={handleEditFormChange}
                className="w-full rounded-[14px] border border-[#e6e6e6] px-4 py-3 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
                rows={3}
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
