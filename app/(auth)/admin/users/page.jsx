"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const emptyForm = {
  username: "",
  email: "",
  address: "",
  telp_number: "",
  birth_date: "",
  gender: "",
  last_edu: "",
  doctor: "",
  status: "",
};

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
  if (status === "Suspended") return "bg-[#fff0d9] text-[#d68a1f]";
  return "bg-[#f3f3f3] text-[#7b7b7b]";
}

export default function AdminUsersPage() {
  const dropdownRef = useRef(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [profiles, setProfiles] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState(emptyForm);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, username, email, status, exp, streak, level, nextLevelXp, bio, telp_number, birth_date, gender, address, last_edu, doctor"
      )
      .eq("role", "user")
      .order("username", { ascending: true });

    if (error) {
      console.error(error);
      setActionMessage(error.message || "Gagal mengambil data profiles.");
      setProfiles([]);
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
    const channel = supabase
      .channel("profiles-admin-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => fetchProfiles()
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
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

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsStatusOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProfiles = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    return profiles.filter((user) => {
      const matchSearch =
        user.username?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword) ||
        user.address?.toLowerCase().includes(keyword) ||
        user.gender?.toLowerCase().includes(keyword);
      const matchStatus = statusFilter === "All" ? true : user.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [profiles, search, statusFilter]);

  const totalUsers = profiles.length;
  const activeUsers = profiles.filter((u) => u.status === "Active").length;
  const suspendedUsers = profiles.filter((u) => u.status === "Suspended").length;
  const pendingUsers = profiles.filter((u) => u.status === "Pending").length;
  const withDoctor = profiles.filter((u) => u.doctor).length;

  const handleExportData = () => {
    const rows = [
      ["Username", "Email", "Gender", "Phone", "Address", "Level", "EXP", "Status", "Joined"],
      ...filteredProfiles.map((u) => [
        u.username || "",
        u.email || "",
        u.gender || "",
        u.telp_number || "",
        u.address || "",
        u.level ?? "",
        u.exp ?? "",
        u.status || "",
        u.created_at ? new Date(u.created_at).toLocaleDateString() : "",
      ]),
    ];
    const csvContent = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "users-data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setActionMessage("User data exported successfully.");
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUserForm.username.trim() || !newUserForm.email.trim()) {
      setActionMessage("Username and Email are required.");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("profiles")
      .insert([{ ...newUserForm, role: "user" }])
      .select();
    setSaving(false);
    if (error) {
      setActionMessage(error.message);
      return;
    }
    setProfiles((prev) => [...data, ...prev]);
    setShowAddModal(false);
    setNewUserForm(emptyForm);
    setActionMessage("User added successfully.");
  };

  const handleOpenEdit = (user) => {
    setEditingUser({ ...user });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser.username.trim() || !editingUser.email.trim()) {
      setActionMessage("Username and Email are required.");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        username: editingUser.username,
        email: editingUser.email,
        address: editingUser.address,
        telp_number: editingUser.telp_number,
        birth_date: editingUser.birth_date,
        gender: editingUser.gender,
        last_edu: editingUser.last_edu,
        doctor: editingUser.doctor,
        status: editingUser.status,
      })
      .eq("id", editingUser.id);
    setSaving(false);
    if (error) {
      setActionMessage(error.message);
      return;
    }
    await fetchProfiles();
    setShowEditModal(false);
    setEditingUser(null);
    setActionMessage("User updated successfully.");
  };

  const handleDeleteUser = async (user) => {
    if (!confirm(`Delete ${user.username || user.email}?`)) return;
    const { error } = await supabase.from("profiles").delete().eq("id", user.id);
    if (error) {
      setActionMessage(error.message);
      return;
    }
    await fetchProfiles();
    setActionMessage("User deleted.");
    if (selectedUser?.id === user.id) setShowViewModal(false);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#d9edf8]">
      {/* Background blur circles + header image */}
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
          {/* Header section */}
          <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-[34px] font-bold leading-none text-[#e1268d] sm:text-[42px]">
                User Management
              </h1>
              <p className="mt-2 text-[18px] text-[#f08bbf]">
                Manage user accounts, view activity, and update profiles
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

          {/* Stat cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[18px] bg-[#bde6e5]/85 px-5 py-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
              <p className="text-[14px] text-[#ea3f97]">Total Users</p>
              <h3 className="mt-2 text-[28px] font-bold text-[#0c72a6]">{totalUsers}</h3>
            </div>
            <div className="rounded-[18px] bg-[#bde6e5]/85 px-5 py-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
              <p className="text-[14px] text-[#ea3f97]">Active Users</p>
              <h3 className="mt-2 text-[28px] font-bold text-[#0c72a6]">{activeUsers}</h3>
            </div>
            <div className="rounded-[18px] bg-[#bde6e5]/85 px-5 py-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
              <p className="text-[14px] text-[#ea3f97]">Suspended</p>
              <h3 className="mt-2 text-[28px] font-bold text-[#0c72a6]">{suspendedUsers}</h3>
            </div>
            <div className="rounded-[18px] bg-[#bde6e5]/85 px-5 py-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
              <p className="text-[14px] text-[#ea3f97]">Pending</p>
              <h3 className="mt-2 text-[28px] font-bold text-[#0c72a6]">{pendingUsers}</h3>
            </div>
          </div>

          {/* Main table card */}
          <div className="mb-6 rounded-[20px] bg-white/85 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-[18px] font-bold text-[#1e1e1e]">User Directory</h2>
                <p className="mt-1 text-[12px] text-[#5c5c5c]">Search and manage all registered users</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  placeholder="Search by username, email, address..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-[44px] min-w-[260px] rounded-full border border-[#e6e6e6] bg-white px-4 text-[14px] text-[#333] placeholder:text-[#9b9b9b] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
                />
                <div ref={dropdownRef} className="relative min-w-[180px]">
                  <button
                    type="button"
                    onClick={() => setIsStatusOpen((prev) => !prev)}
                    className="flex h-[44px] w-full items-center rounded-full border border-[#e6e6e6] bg-white pl-5 pr-4 text-[14px] text-[#333] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
                  >
                    <span className="flex-1 text-center">
                      {statusFilter === "All" ? "All Status" : statusFilter}
                    </span>
                    <span className="ml-3 shrink-0 text-[12px] text-[#666]">▼</span>
                  </button>
                  {isStatusOpen && (
                    <div className="absolute right-0 z-20 mt-2 w-full overflow-hidden rounded-[18px] border border-[#f0d8e5] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                      {["All", "Active", "Pending", "Suspended"].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => {
                            setStatusFilter(status);
                            setIsStatusOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-center text-[14px] transition ${statusFilter === status
                              ? "bg-[#ffe7f1] font-medium text-[#db2d8d]"
                              : "text-[#333] hover:bg-[#fff5fa]"
                            }`}
                        >
                          {status === "All" ? "All Status" : status}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[1050px] border-collapse">
                <thead>
                  <tr className="border-b border-[#ea3f97]">
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">No</th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">Username</th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">Email</th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">Gender</th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">Phone</th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">Address</th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">Level</th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">EXP</th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">Action</th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="10" className="px-4 py-10 text-center text-[14px] text-[#7a7a7a]">Loading users...</td>
                    </tr>
                  ) : filteredProfiles.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-4 py-10 text-center text-[14px] text-[#7a7a7a]">No users found.</td>
                    </tr>
                  ) : (
                    filteredProfiles.map((user, index) => (
                      <tr key={user.id} className="border-b border-[#f2f2f2] last:border-b-0">
                        <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">{index + 1}</td>
                        <td className="px-4 py-4 text-[14px] font-medium text-[#262626]">{user.username || "-"}</td>
                        <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">{user.email || "-"}</td>
                        <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">{user.gender || "-"}</td>
                        <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">{user.telp_number || "-"}</td>
                        <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">{user.address || "-"}</td>
                        <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">{user.level ?? "-"}</td>
                        <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">{user.exp ?? "-"}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleOpenEdit(user)}
                              className="rounded-full bg-[#ffe7f1] px-3 py-1.5 text-[12px] font-medium text-[#db2d8d] transition hover:opacity-90"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="rounded-full bg-[#f3f3f3] px-3 py-1.5 text-[12px] font-medium text-[#666] transition hover:opacity-90"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-3 py-1 text-[12px] font-medium ${getStatusClass(user.status)}`}>
                            {user.status || "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions & Insights (tetap sama) */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div className="rounded-[20px] bg-[#e7daf0]/85 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
              <h2 className="text-[18px] font-bold text-[#1e1e1e]">User Insights</h2>
              <div className="mt-5 space-y-4">
                <div className="rounded-[14px] bg-white/50 px-4 py-4">
                  <p className="text-[13px] text-[#ea3f97]">Most active user (by EXP)</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#222]">
                    {[...profiles].sort((a, b) => (b.exp || 0) - (a.exp || 0))[0]?.username || "-"}
                  </p>
                </div>
                <div className="rounded-[14px] bg-white/50 px-4 py-4">
                  <p className="text-[13px] text-[#ea3f97]">Most assigned doctor</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#222]">
                    {(() => {
                      const freq = {};
                      profiles.forEach(u => { if (u.doctor) freq[u.doctor] = (freq[u.doctor] || 0) + 1; });
                      const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
                      return top ? `${top[0]} (${top[1]})` : "-";
                    })()}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-[20px] bg-[#bde6e5]/85 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
              <h2 className="text-[18px] font-bold text-[#1e1e1e]">Quick Actions</h2>
              <div className="mt-5 flex flex-col gap-3">
                <button onClick={handleExportData} className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80">
                  <p className="text-[15px] font-semibold text-[#db2d8d]">Export Data</p>
                  <p className="mt-1 text-[12px] text-[#666]">Download user records (CSV)</p>
                </button>
                <button onClick={() => setStatusFilter("Pending")} className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80">
                  <p className="text-[15px] font-semibold text-[#db2d8d]">Review Pending</p>
                  <p className="mt-1 text-[12px] text-[#666]">Check pending accounts</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== MODALS (tetap sama) ========== */}
      {/* View Modal (tetap ada untuk melihat detail, tapi tidak ditampilkan di tabel) */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-[500px] rounded-[24px] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[26px] font-bold text-[#db2d8d]">User Details</h2>
                <p className="mt-1 text-[14px] text-[#777]">Complete profile information</p>
              </div>
              <button onClick={() => setShowViewModal(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f7] text-[18px] text-[#555] transition hover:bg-[#efefef]">×</button>
            </div>
            <div className="space-y-4">
              <div className="rounded-[14px] bg-[#fff5fa] px-4 py-3"><p className="text-[12px] text-[#ea3f97]">Username</p><p className="mt-1 text-[15px] font-semibold">{selectedUser.username || "-"}</p></div>
              <div className="rounded-[14px] bg-[#f4fbff] px-4 py-3"><p className="text-[12px] text-[#0c72a6]">Email</p><p className="mt-1 text-[15px] font-semibold">{selectedUser.email || "-"}</p></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-[14px] bg-[#fff5fa] px-4 py-3"><p className="text-[12px] text-[#ea3f97]">Gender</p><p className="mt-1 text-[15px] font-semibold">{selectedUser.gender || "-"}</p></div>
                <div className="rounded-[14px] bg-[#f4fbff] px-4 py-3"><p className="text-[12px] text-[#0c72a6]">Phone</p><p className="mt-1 text-[15px] font-semibold">{selectedUser.telp_number || "-"}</p></div>
              </div>
              <div className="rounded-[14px] bg-[#fff5fa] px-4 py-3"><p className="text-[12px] text-[#ea3f97]">Address</p><p className="mt-1 text-[15px] font-semibold">{selectedUser.address || "-"}</p></div>
              <div className="rounded-[14px] bg-[#f4fbff] px-4 py-3"><p className="text-[12px] text-[#0c72a6]">Level</p><p className="mt-1 text-[15px] font-semibold">{selectedUser.level ?? "-"}</p></div>
              <div className="rounded-[14px] bg-[#fff5fa] px-4 py-3"><p className="text-[12px] text-[#ea3f97]">EXP</p><p className="mt-1 text-[15px] font-semibold">{selectedUser.exp ?? "-"}</p></div>
              <div className="flex justify-end pt-2"><button onClick={() => setShowViewModal(false)} className="rounded-full bg-[#db2d8d] px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#c8277e]">Close</button></div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal (sama seperti sebelumnya) */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-[560px] rounded-[24px] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div><h2 className="text-[26px] font-bold text-[#db2d8d]">Edit User</h2><p className="mt-1 text-[14px] text-[#777]">Update user information</p></div>
              <button onClick={() => { setShowEditModal(false); setEditingUser(null); }} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f7] text-[18px] text-[#555] transition hover:bg-[#efefef]">×</button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <input type="text" name="username" value={editingUser.username || ""} onChange={handleEditChange} placeholder="Full name" className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] placeholder:text-[#9b9b9b] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20" required />
              <input type="email" name="email" value={editingUser.email || ""} onChange={handleEditChange} placeholder="Email address" className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] placeholder:text-[#9b9b9b] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20" required />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="telp_number" value={editingUser.telp_number || ""} onChange={handleEditChange} placeholder="Phone number" className="h-[48px] rounded-[14px] border border-[#e6e6e6] px-4 text-[14px]" />
                <select name="gender" value={editingUser.gender || ""} onChange={handleEditChange} className="h-[48px] rounded-[14px] border border-[#e6e6e6] px-4 text-[14px]"><option value="">Gender</option><option>Female</option><option>Male</option><option>Other</option></select>
              </div>
              <input type="text" name="address" value={editingUser.address || ""} onChange={handleEditChange} placeholder="Address" className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px]" />
              <input type="text" name="doctor" value={editingUser.doctor || ""} onChange={handleEditChange} placeholder="Doctor name" className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px]" />
              <select name="status" value={editingUser.status || "Pending"} onChange={handleEditChange} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px]"><option>Active</option><option>Pending</option><option>Suspended</option></select>
              <div className="flex flex-wrap justify-between gap-3 pt-2">
                <button type="button" onClick={() => handleDeleteUser(editingUser)} className="rounded-full bg-[#f3f3f3] px-5 py-2.5 text-[14px] font-medium text-[#666] transition hover:bg-[#ebebeb]">Delete User</button>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowEditModal(false)} className="rounded-full border border-[#d8d8d8] bg-white px-5 py-2.5 text-[14px] font-medium text-[#555] transition hover:bg-[#f8f8f8]">Cancel</button>
                  <button type="submit" disabled={saving} className="rounded-full bg-[#db2d8d] px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#c8277e]">{saving ? "Saving..." : "Save Changes"}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal (sama) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-[560px] rounded-[24px] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div><h2 className="text-[26px] font-bold text-[#db2d8d]">Add New User</h2><p className="mt-1 text-[14px] text-[#777]">Fill in the user details</p></div>
              <button onClick={() => setShowAddModal(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f7] text-[18px] text-[#555] transition hover:bg-[#efefef]">×</button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              <input type="text" name="username" value={newUserForm.username} onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })} placeholder="Full name" className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] placeholder:text-[#9b9b9b] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20" required />
              <input type="email" name="email" value={newUserForm.email} onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })} placeholder="Email address" className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] placeholder:text-[#9b9b9b] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20" required />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="telp_number" value={newUserForm.telp_number} onChange={(e) => setNewUserForm({ ...newUserForm, telp_number: e.target.value })} placeholder="Phone number" className="h-[48px] rounded-[14px] border border-[#e6e6e6] px-4 text-[14px]" />
                <select name="gender" value={newUserForm.gender} onChange={(e) => setNewUserForm({ ...newUserForm, gender: e.target.value })} className="h-[48px] rounded-[14px] border border-[#e6e6e6] px-4 text-[14px]"><option value="">Gender</option><option>Female</option><option>Male</option><option>Other</option></select>
              </div>
              <input type="text" name="address" value={newUserForm.address} onChange={(e) => setNewUserForm({ ...newUserForm, address: e.target.value })} placeholder="Address" className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px]" />
              <input type="text" name="doctor" value={newUserForm.doctor} onChange={(e) => setNewUserForm({ ...newUserForm, doctor: e.target.value })} placeholder="Doctor (optional)" className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px]" />
              <select name="status" value={newUserForm.status} onChange={(e) => setNewUserForm({ ...newUserForm, status: e.target.value })} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px]"><option>Pending</option><option>Active</option><option>Suspended</option></select>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="rounded-full border border-[#d8d8d8] bg-white px-5 py-2.5 text-[14px] font-medium text-[#555] transition hover:bg-[#f8f8f8]">Cancel</button>
                <button type="submit" className="rounded-full bg-[#db2d8d] px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#c8277e]">Add User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}