"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function calculateLevel(xp) {
    return Math.max(1, Math.floor(xp / 150) + 1);
}

export default function ProfilePage() {
    const router = useRouter();

    const [currentUser, setCurrentUser] = useState(null);
    const [profileData, setProfileData] = useState({
        fullName: "",
        birthDate: "",
        lastEducation: "",
        gender: "",
        domicile: "",
        username: "",
        email: "",
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const storedCurrentUser = JSON.parse(localStorage.getItem("currentUser"));

        const fallbackUser = {
            username: "Buddy",
            email: "12345@healinq.com",
            xp: 1240,
            password: "12345",
        };

        const activeUser = storedCurrentUser || fallbackUser;
        setCurrentUser(activeUser);

        const savedProfile = JSON.parse(
            localStorage.getItem(`profileData_${activeUser.email}`)
        );

        if (savedProfile) {
            setProfileData(savedProfile);
        } else {
            const initialProfile = {
                fullName: "Buddy",
                birthDate: "",
                lastEducation: "",
                gender: "",
                domicile: "",
                username: activeUser.username || "Buddy",
                email: activeUser.email || "12345@healinq.com",
            };

            setProfileData(initialProfile);
            localStorage.setItem(
                `profileData_${activeUser.email}`,
                JSON.stringify(initialProfile)
            );
        }
    }, []);

    useEffect(() => {
        if (!message) return;

        const timer = setTimeout(() => {
            setMessage("");
        }, 2500);

        return () => clearTimeout(timer);
    }, [message]);

    const level = useMemo(() => {
        return calculateLevel(currentUser?.xp || 0);
    }, [currentUser]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();

        if (!currentUser?.email) return;

        const updatedUser = {
            ...currentUser,
            username: profileData.username,
            email: profileData.email,
        };

        setCurrentUser(updatedUser);

        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        localStorage.setItem(
            `profileData_${updatedUser.email}`,
            JSON.stringify(profileData)
        );

        setMessage("Profile updated successfully.");
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();

        if (!currentUser) return;

        if (
            !passwordData.currentPassword.trim() ||
            !passwordData.newPassword.trim() ||
            !passwordData.confirmPassword.trim()
        ) {
            setMessage("Please complete all password fields.");
            return;
        }

        if (passwordData.currentPassword !== (currentUser.password || "12345")) {
            setMessage("Current password is incorrect.");
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage("New password and confirmation do not match.");
            return;
        }

        const updatedUser = {
            ...currentUser,
            password: passwordData.newPassword,
        };

        setCurrentUser(updatedUser);
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));

        setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });

        setShowPasswordModal(false);
        setMessage("Password changed successfully.");
    };

    const handleLogout = () => {
        localStorage.removeItem("currentUser");
        router.push("/login");
    };

    const handleDeleteAccount = () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete your account?"
        );

        if (!confirmed || !currentUser?.email) return;

        localStorage.removeItem(`profileData_${currentUser.email}`);
        localStorage.removeItem(`journalEntries_${currentUser.email}`);
        localStorage.removeItem(`moodToday_${currentUser.email}`);
        localStorage.removeItem("currentUser");

        router.push("/signup");
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
            </div>

            <section className="relative z-10 mx-auto w-full max-w-[1100px] px-6 py-10 sm:px-8 lg:px-10">
                <div className="mb-6">
                    <button
                        onClick={() => router.push("/dashboard/user")}
                        className="flex items-center gap-3 rounded-full bg-white/80 px-4 py-2 shadow-sm transition hover:bg-white"
                    >
                        <Image
                            src="/images/icon_back.png"
                            alt="Back"
                            width={20}
                            height={20}
                            className="object-contain"
                        />
                        <span className="text-[14px] font-medium text-[#2a3a4d]">
                            Back to Dashboard
                        </span>
                    </button>
                </div>
                <div className="mb-8 flex flex-col items-center text-center">
                    <div className="mb-5 flex items-center justify-center">
                        <Image
                            src="/images/icon_profile.png"
                            alt="Profile"
                            width={200}
                            height={200}
                            className="h-[200px] w-[200px] object-contain"
                        />
                    </div>

                    <h1 className="text-[42px] font-bold leading-none text-[#2a3a4d]">
                        {profileData.fullName || "Buddy"}
                    </h1>
                    <p className="mt-2 text-[22px] text-[#5d6b7c]">
                        @{profileData.username || "12345"}
                    </p>
                    <p className="mt-2 text-[20px] text-[#9aa0a8]">
                        {profileData.email || "12345@healinq.com"}
                    </p>

                    {message && (
                        <div className="mt-5 rounded-full bg-white/90 px-4 py-2 text-[13px] font-medium text-[#db2d8d] shadow-sm">
                            {message}
                        </div>
                    )}
                </div>

                <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="rounded-[24px] bg-[#bde6e5]/85 p-6 text-center shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                        <p className="text-[15px] text-[#6d6d6d]">Level</p>
                        <h2 className="mt-2 text-[44px] font-bold text-[#48b9aa]">
                            {level}
                        </h2>
                    </div>

                    <div className="rounded-[24px] bg-[#e7daf0]/85 p-6 text-center shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                        <p className="text-[15px] text-[#6d6d6d]">XP</p>
                        <h2 className="mt-2 text-[44px] font-bold text-[#db2d8d]">
                            {currentUser?.xp || 1240}
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_0.9fr]">
                    <div className="rounded-[28px] bg-white/85 p-6 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                        <div className="mb-6">
                            <h2 className="text-[28px] font-bold text-[#db2d8d]">
                                Edit Profile
                            </h2>
                            <p className="mt-2 text-[15px] text-[#7a7a7a]">
                                Complete and update your personal information here
                            </p>
                        </div>

                        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-[14px] font-medium text-[#666]">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={profileData.fullName}
                                    onChange={handleProfileChange}
                                    className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-[14px] font-medium text-[#666]">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    name="birthDate"
                                    value={profileData.birthDate}
                                    onChange={handleProfileChange}
                                    className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-[14px] font-medium text-[#666]">
                                    Last Education
                                </label>
                                <select
                                    name="lastEducation"
                                    value={profileData.lastEducation}
                                    onChange={handleProfileChange}
                                    className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
                                >
                                    <option value="">Select education</option>
                                    <option value="Kindergarten">Kindergarten</option>
                                    <option value="Elementary School">Elementary School</option>
                                    <option value="Junior High School">Junior High School</option>
                                    <option value="Senior High School">Senior High School</option>
                                    <option value="Bachelor Degree">Bachelor Degree</option>
                                    <option value="Master Degree">Master Degree</option>
                                    <option value="Doctoral Degree">Doctoral Degree</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-[14px] font-medium text-[#666]">
                                    Gender
                                </label>
                                <select
                                    name="gender"
                                    value={profileData.gender}
                                    onChange={handleProfileChange}
                                    className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
                                >
                                    <option value="">Select gender</option>
                                    <option value="Female">Female</option>
                                    <option value="Male">Male</option>
                                    <option value="Prefer not to say">Prefer not to say</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-[14px] font-medium text-[#666]">
                                    Domicile
                                </label>
                                <input
                                    type="text"
                                    name="domicile"
                                    value={profileData.domicile}
                                    onChange={handleProfileChange}
                                    placeholder="e.g. Jakarta"
                                    className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] placeholder:text-[#9b9b9b] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-[14px] font-medium text-[#666]">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={profileData.username}
                                    onChange={handleProfileChange}
                                    className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-2 block text-[14px] font-medium text-[#666]">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profileData.email}
                                    onChange={handleProfileChange}
                                    className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
                                />
                            </div>

                            <div className="md:col-span-2 flex flex-wrap justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(true)}
                                    className="rounded-full border border-[#db2d8d] bg-white px-5 py-2.5 text-[14px] font-medium text-[#db2d8d] transition hover:bg-[#fff5fa]"
                                >
                                    Change Password
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

                    <div className="space-y-6">
                        <div className="rounded-[28px] bg-[#bde6e5]/85 p-6 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                            <h2 className="text-[24px] font-bold text-[#2a3a4d]">
                                Account Actions
                            </h2>
                            <p className="mt-2 text-[14px] text-[#6f6f6f]">
                                Manage your account access and security
                            </p>

                            <div className="mt-5 space-y-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(true)}
                                    className="w-full rounded-[14px] bg-white/75 px-4 py-4 text-left transition hover:bg-white"
                                >
                                    <p className="text-[16px] font-semibold text-[#db2d8d]">
                                        Change Password
                                    </p>
                                    <p className="mt-1 text-[13px] text-[#666]">
                                        Update your account password securely
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="w-full rounded-[14px] bg-white/75 px-4 py-4 text-left transition hover:bg-white"
                                >
                                    <p className="text-[16px] font-semibold text-[#0c72a6]">
                                        Logout
                                    </p>
                                    <p className="mt-1 text-[13px] text-[#666]">
                                        Sign out from your current account
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDeleteAccount}
                                    className="w-full rounded-[14px] bg-white/75 px-4 py-4 text-left transition hover:bg-white"
                                >
                                    <p className="text-[16px] font-semibold text-[#d64b7f]">
                                        Delete Account
                                    </p>
                                    <p className="mt-1 text-[13px] text-[#666]">
                                        Permanently remove your account data
                                    </p>
                                </button>
                            </div>
                        </div>

                        <div className="rounded-[28px] bg-[#e7daf0]/85 p-6 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                            <h2 className="text-[24px] font-bold text-[#2a3a4d]">
                                Account Summary
                            </h2>

                            <div className="mt-5 space-y-4">
                                <div className="rounded-[14px] bg-white/60 px-4 py-4">
                                    <p className="text-[13px] text-[#ea3f97]">Username</p>
                                    <p className="mt-1 text-[16px] font-semibold text-[#222]">
                                        @{profileData.username || "-"}
                                    </p>
                                </div>

                                <div className="rounded-[14px] bg-white/60 px-4 py-4">
                                    <p className="text-[13px] text-[#ea3f97]">Email</p>
                                    <p className="mt-1 text-[16px] font-semibold text-[#222]">
                                        {profileData.email || "-"}
                                    </p>
                                </div>

                                <div className="rounded-[14px] bg-white/60 px-4 py-4">
                                    <p className="text-[13px] text-[#ea3f97]">Current XP</p>
                                    <p className="mt-1 text-[16px] font-semibold text-[#222]">
                                        {currentUser?.xp || 1240}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
                    <div className="w-full max-w-[500px] rounded-[24px] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-[26px] font-bold text-[#db2d8d]">
                                    Change Password
                                </h2>
                                <p className="mt-1 text-[14px] text-[#777]">
                                    Update your password for better account security
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

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <input
                                type="password"
                                name="currentPassword"
                                placeholder="Current password"
                                value={passwordData.currentPassword}
                                onChange={(e) =>
                                    setPasswordData((prev) => ({
                                        ...prev,
                                        currentPassword: e.target.value,
                                    }))
                                }
                                className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] placeholder:text-[#9b9b9b] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
                            />

                            <input
                                type="password"
                                name="newPassword"
                                placeholder="New password"
                                value={passwordData.newPassword}
                                onChange={(e) =>
                                    setPasswordData((prev) => ({
                                        ...prev,
                                        newPassword: e.target.value,
                                    }))
                                }
                                className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] placeholder:text-[#9b9b9b] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
                            />

                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm new password"
                                value={passwordData.confirmPassword}
                                onChange={(e) =>
                                    setPasswordData((prev) => ({
                                        ...prev,
                                        confirmPassword: e.target.value,
                                    }))
                                }
                                className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] placeholder:text-[#9b9b9b] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
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
                                    Save Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}