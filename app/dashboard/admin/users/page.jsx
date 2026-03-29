"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const initialUsersData = [
  {
    id: 1,
    name: "Alya Putri",
    email: "alya@gmail.com",
    address: "Jakarta, Indonesia",
    joined: "Mar 28, 2026",
    status: "Active",
    role: "User",
  },
  {
    id: 2,
    name: "Nadhif Ramadhan",
    email: "nadhif@gmail.com",
    address: "Bandung, Indonesia",
    joined: "Mar 27, 2026",
    status: "Active",
    role: "User",
  },
  {
    id: 3,
    name: "Citra Maharani",
    email: "citra@gmail.com",
    address: "Surabaya, Indonesia",
    joined: "Mar 26, 2026",
    status: "Inactive",
    role: "User",
  },
  {
    id: 4,
    name: "Raka Pratama",
    email: "raka@gmail.com",
    address: "Yogyakarta, Indonesia",
    joined: "Mar 25, 2026",
    status: "Active",
    role: "User",
  },
  {
    id: 5,
    name: "Salwa Nabila",
    email: "salwa@gmail.com",
    address: "Medan, Indonesia",
    joined: "Mar 24, 2026",
    status: "Suspended",
    role: "User",
  },
  {
    id: 6,
    name: "Kevin Saputra",
    email: "kevin@gmail.com",
    address: "Semarang, Indonesia",
    joined: "Mar 23, 2026",
    status: "Active",
    role: "User",
  },
];

function formatTopDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatJoinDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
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
  return "bg-[#ffe1ea] text-[#d64b7f]";
}

export default function AdminUsersPage() {
  const pathname = usePathname();
  const dropdownRef = useRef(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [users, setUsers] = useState(initialUsersData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    address: "",
    status: "Active",
  });

  const isOverview = pathname === "/dashboard/admin";
  const isUsers = pathname === "/dashboard/admin/users";
  const isCounselors = pathname === "/dashboard/admin/counselors";
  const isTransactions = pathname === "/dashboard/admin/transactions";
  const isActivity = pathname === "/dashboard/admin/activity";

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsStatusOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!actionMessage) return;

    const timer = setTimeout(() => {
      setActionMessage("");
    }, 2500);

    return () => clearTimeout(timer);
  }, [actionMessage]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.address.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "All" ? true : user.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [users, search, statusFilter]);

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.status === "Active").length;
  const inactiveUsers = users.filter((user) => user.status === "Inactive").length;
  const suspendedUsers = users.filter((user) => user.status === "Suspended").length;

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUserForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddUser = (e) => {
    e.preventDefault();

    if (
      !newUserForm.name.trim() ||
      !newUserForm.email.trim() ||
      !newUserForm.address.trim()
    ) {
      setActionMessage("Please complete all fields first.");
      return;
    }

    const emailExists = users.some(
      (user) => user.email.toLowerCase() === newUserForm.email.toLowerCase()
    );

    if (emailExists) {
      setActionMessage("This email is already registered.");
      return;
    }

    const newUser = {
      id: Date.now(),
      name: newUserForm.name.trim(),
      email: newUserForm.email.trim(),
      address: newUserForm.address.trim(),
      joined: formatJoinDate(new Date()),
      status: newUserForm.status,
      role: "User",
    };

    setUsers((prev) => [newUser, ...prev]);
    setShowAddModal(false);
    setNewUserForm({
      name: "",
      email: "",
      address: "",
      status: "Active",
    });
    setActionMessage("New user added successfully.");
  };

  const handleExportData = () => {
    const rows = [
      ["Name", "Email", "Address", "Joined", "Status", "Role"],
      ...filteredUsers.map((user) => [
        user.name,
        user.email,
        user.address,
        user.joined,
        user.status,
        user.role,
      ]),
    ];

    const csvContent = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
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

  const handleFilterActive = () => {
    setStatusFilter("Active");
    setIsStatusOpen(false);
    setActionMessage("Showing active users only.");
  };

  const handleReviewSuspended = () => {
    setStatusFilter("Suspended");
    setIsStatusOpen(false);
    setActionMessage("Showing suspended users only.");
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleOpenEditUser = (user) => {
    setEditingUser({ ...user });
    setShowEditModal(true);
  };

  const handleEditUserChange = (e) => {
    const { name, value } = e.target;
    setEditingUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEditUser = (e) => {
    e.preventDefault();

    if (
      !editingUser.name.trim() ||
      !editingUser.email.trim() ||
      !editingUser.address.trim()
    ) {
      setActionMessage("Please complete all edit fields first.");
      return;
    }

    const emailUsedByAnotherUser = users.some(
      (user) =>
        user.id !== editingUser.id &&
        user.email.toLowerCase() === editingUser.email.toLowerCase()
    );

    if (emailUsedByAnotherUser) {
      setActionMessage("This email is already used by another user.");
      return;
    }

    setUsers((prev) =>
      prev.map((user) => (user.id === editingUser.id ? editingUser : user))
    );
    setShowEditModal(false);
    setEditingUser(null);
    setActionMessage("User updated successfully.");
  };

  const handleDeleteUser = (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) return;

    setUsers((prev) => prev.filter((user) => user.id !== userId));
    setActionMessage("User deleted successfully.");

    if (selectedUser?.id === userId) {
      setShowViewModal(false);
      setSelectedUser(null);
    }

    if (editingUser?.id === userId) {
      setShowEditModal(false);
      setEditingUser(null);
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

      <div className="relative z-10 flex">
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-[160px] flex-col items-center bg-[#efc6dc] px-4 py-6 shadow-sm">
          <Link
            href="/profile"
            className="mb-10 flex h-[64px] w-[64px] items-center justify-center rounded-full transition hover:scale-105"
            title="Profile"
          >
            <Image
              src="/images/icon_profile.png"
              alt="Profile"
              width={64}
              height={64}
              className="h-[64px] w-[64px] object-contain"
            />
          </Link>

          <nav className="flex w-full flex-col items-center gap-4">
            <Link
              href="/dashboard/admin"
              className={`flex min-h-[52px] w-full items-center justify-center rounded-full px-4 text-center text-[16px] font-semibold transition ${
                isOverview
                  ? "bg-white text-[#db2d8d] shadow-[0_4px_10px_rgba(0,0,0,0.12)]"
                  : "text-white hover:bg-white/20"
              }`}
            >
              Dashboard
            </Link>

            <Link
              href="/dashboard/admin/users"
              className={`flex min-h-[52px] w-full items-center justify-center rounded-full px-4 text-center text-[16px] font-semibold transition ${
                isUsers
                  ? "bg-white text-[#db2d8d] shadow-[0_4px_10px_rgba(0,0,0,0.12)]"
                  : "text-white hover:bg-white/20"
              }`}
            >
              Users
            </Link>

            <Link
              href="/dashboard/admin/counselors"
              className={`flex min-h-[52px] w-full items-center justify-center rounded-full px-4 text-center text-[16px] font-semibold transition ${
                isCounselors
                  ? "bg-white text-[#db2d8d] shadow-[0_4px_10px_rgba(0,0,0,0.12)]"
                  : "text-white hover:bg-white/20"
              }`}
            >
              Counselors
            </Link>

            <Link
              href="/dashboard/admin/transactions"
              className={`flex min-h-[52px] w-full items-center justify-center rounded-full px-4 text-center text-[16px] font-semibold transition ${
                isTransactions
                  ? "bg-white text-[#db2d8d] shadow-[0_4px_10px_rgba(0,0,0,0.12)]"
                  : "text-white hover:bg-white/20"
              }`}
            >
              Transactions
            </Link>

            <Link
              href="/dashboard/admin/activity"
              className={`flex min-h-[52px] w-full items-center justify-center rounded-full px-4 text-center text-[16px] font-semibold transition ${
                isActivity
                  ? "bg-white text-[#db2d8d] shadow-[0_4px_10px_rgba(0,0,0,0.12)]"
                  : "text-white hover:bg-white/20"
              }`}
            >
              Activity
            </Link>
          </nav>
        </aside>

        <section className="ml-[160px] w-full px-6 pt-40 pb-6 sm:px-8 lg:px-12">
          <div className="relative">
            <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-[34px] font-bold leading-none text-[#e1268d] sm:text-[42px]">
                  User Management
                </h1>
                <p className="mt-2 text-[18px] text-[#f08bbf]">
                  Manage registered users, statuses, and account details
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

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[18px] bg-[#bde6e5]/85 px-5 py-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                <p className="text-[14px] text-[#ea3f97]">Total Users</p>
                <h3 className="mt-2 text-[28px] font-bold text-[#0c72a6]">
                  {totalUsers}
                </h3>
              </div>

              <div className="rounded-[18px] bg-[#bde6e5]/85 px-5 py-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                <p className="text-[14px] text-[#ea3f97]">Active Users</p>
                <h3 className="mt-2 text-[28px] font-bold text-[#0c72a6]">
                  {activeUsers}
                </h3>
              </div>

              <div className="rounded-[18px] bg-[#bde6e5]/85 px-5 py-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                <p className="text-[14px] text-[#ea3f97]">Inactive Users</p>
                <h3 className="mt-2 text-[28px] font-bold text-[#0c72a6]">
                  {inactiveUsers}
                </h3>
              </div>

              <div className="rounded-[18px] bg-[#bde6e5]/85 px-5 py-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                <p className="text-[14px] text-[#ea3f97]">Suspended Users</p>
                <h3 className="mt-2 text-[28px] font-bold text-[#0c72a6]">
                  {suspendedUsers}
                </h3>
              </div>
            </div>

            <div className="mb-6 rounded-[20px] bg-white/85 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-[18px] font-bold text-[#1e1e1e]">
                    User Directory
                  </h2>
                  <p className="mt-1 text-[12px] text-[#5c5c5c]">
                    Search and manage all registered users
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    placeholder="Search user, email, or address..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-[44px] min-w-[240px] rounded-full border border-[#e6e6e6] bg-white px-4 text-[14px] text-[#333] placeholder:text-[#9b9b9b] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
                  />

                  <div ref={dropdownRef} className="relative min-w-[180px]">
                    <button
                      type="button"
                      onClick={() => setIsStatusOpen((prev) => !prev)}
                      className="flex h-[44px] w-full items-center rounded-full border border-[#e6e6e6] bg-white pl-5 pr-4 text-[14px] text-[#333] shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
                    >
                      <span className="flex-1 text-center">
                        {statusFilter === "All" ? "All Status" : statusFilter}
                      </span>
                      <span className="ml-3 shrink-0 text-[12px] text-[#666]">
                        ▼
                      </span>
                    </button>

                    {isStatusOpen && (
                      <div className="absolute right-0 z-20 mt-2 w-full overflow-hidden rounded-[18px] border border-[#f0d8e5] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                        {["All", "Active", "Inactive", "Suspended"].map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => {
                              setStatusFilter(status);
                              setIsStatusOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-center text-[14px] transition ${
                              statusFilter === status
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
                <table className="w-full min-w-[900px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#ea3f97]">
                      <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">
                        Address
                      </th>
                      <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">
                        Joined
                      </th>
                      <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-[#f2f2f2] last:border-b-0"
                      >
                        <td className="px-4 py-4 text-[14px] font-medium text-[#262626]">
                          {user.name}
                        </td>
                        <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">
                          {user.email}
                        </td>
                        <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">
                          {user.address}
                        </td>
                        <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">
                          {user.joined}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-[12px] font-medium ${getStatusClass(
                              user.status
                            )}`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleViewUser(user)}
                              className="rounded-full bg-[#dff1ff] px-3 py-1.5 text-[12px] font-medium text-[#0c72a6] transition hover:opacity-90"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditUser(user)}
                              className="rounded-full bg-[#ffe7f1] px-3 py-1.5 text-[12px] font-medium text-[#db2d8d] transition hover:opacity-90"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user.id)}
                              className="rounded-full bg-[#f3f3f3] px-3 py-1.5 text-[12px] font-medium text-[#666] transition hover:opacity-90"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredUsers.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-10 text-center text-[14px] text-[#7a7a7a]"
                        >
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <div className="rounded-[20px] bg-[#e7daf0]/85 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                <h2 className="text-[18px] font-bold text-[#1e1e1e]">
                  User Insights
                </h2>

                <div className="mt-5 space-y-4">
                  <div className="rounded-[14px] bg-white/50 px-4 py-4">
                    <p className="text-[13px] text-[#ea3f97]">Most recent join</p>
                    <p className="mt-1 text-[16px] font-semibold text-[#222]">
                      {users[0]?.name || "-"}
                    </p>
                  </div>

                  <div className="rounded-[14px] bg-white/50 px-4 py-4">
                    <p className="text-[13px] text-[#ea3f97]">Most common status</p>
                    <p className="mt-1 text-[16px] font-semibold text-[#222]">
                      {activeUsers >= inactiveUsers && activeUsers >= suspendedUsers
                        ? "Active"
                        : inactiveUsers >= suspendedUsers
                        ? "Inactive"
                        : "Suspended"}
                    </p>
                  </div>

                  <div className="rounded-[14px] bg-white/50 px-4 py-4">
                    <p className="text-[13px] text-[#ea3f97]">Default role</p>
                    <p className="mt-1 text-[16px] font-semibold text-[#222]">
                      User
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[20px] bg-[#bde6e5]/85 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                <h2 className="text-[18px] font-bold text-[#1e1e1e]">
                  Quick Actions
                </h2>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80"
                  >
                    <p className="text-[15px] font-semibold text-[#db2d8d]">
                      Add User
                    </p>
                    <p className="mt-1 text-[12px] text-[#666]">
                      Create a new user account
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportData}
                    className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80"
                  >
                    <p className="text-[15px] font-semibold text-[#db2d8d]">
                      Export Data
                    </p>
                    <p className="mt-1 text-[12px] text-[#666]">
                      Download user records
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={handleFilterActive}
                    className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80"
                  >
                    <p className="text-[15px] font-semibold text-[#db2d8d]">
                      Filter Active
                    </p>
                    <p className="mt-1 text-[12px] text-[#666]">
                      Show only active users
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={handleReviewSuspended}
                    className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80"
                  >
                    <p className="text-[15px] font-semibold text-[#db2d8d]">
                      Review Suspended
                    </p>
                    <p className="mt-1 text-[12px] text-[#666]">
                      Check restricted accounts
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-[520px] rounded-[24px] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[26px] font-bold text-[#db2d8d]">
                  Add New User
                </h2>
                <p className="mt-1 text-[14px] text-[#777]">
                  Fill in the user information below
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f7] text-[18px] text-[#555] transition hover:bg-[#efefef]"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Full name"
                value={newUserForm.name}
                onChange={handleNewUserChange}
                className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] placeholder:text-[#9b9b9b] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              />

              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={newUserForm.email}
                onChange={handleNewUserChange}
                className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] placeholder:text-[#9b9b9b] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              />

              <input
                type="text"
                name="address"
                placeholder="Address"
                value={newUserForm.address}
                onChange={handleNewUserChange}
                className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] placeholder:text-[#9b9b9b] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-[#666]">
                    Status
                  </label>
                  <select
                    name="status"
                    value={newUserForm.status}
                    onChange={handleNewUserChange}
                    className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-medium text-[#666]">
                    Role
                  </label>
                  <div className="flex h-[48px] items-center rounded-[14px] border border-[#e6e6e6] bg-[#fafafa] px-4 text-[14px] text-[#666]">
                    User
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-full border border-[#d8d8d8] bg-white px-5 py-2.5 text-[14px] font-medium text-[#555] transition hover:bg-[#f8f8f8]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-full bg-[#db2d8d] px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#c8277e]"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-[460px] rounded-[24px] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[26px] font-bold text-[#db2d8d]">
                  User Detail
                </h2>
                <p className="mt-1 text-[14px] text-[#777]">
                  Detailed information for this user
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedUser(null);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f7] text-[18px] text-[#555] transition hover:bg-[#efefef]"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-[14px] bg-[#fff5fa] px-4 py-3">
                <p className="text-[12px] text-[#ea3f97]">Full Name</p>
                <p className="mt-1 text-[15px] font-semibold text-[#222]">
                  {selectedUser.name}
                </p>
              </div>

              <div className="rounded-[14px] bg-[#f4fbff] px-4 py-3">
                <p className="text-[12px] text-[#0c72a6]">Email</p>
                <p className="mt-1 text-[15px] font-semibold text-[#222]">
                  {selectedUser.email}
                </p>
              </div>

              <div className="rounded-[14px] bg-[#fff5fa] px-4 py-3">
                <p className="text-[12px] text-[#ea3f97]">Address</p>
                <p className="mt-1 text-[15px] font-semibold text-[#222]">
                  {selectedUser.address}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-[14px] bg-[#f4fbff] px-4 py-3">
                  <p className="text-[12px] text-[#0c72a6]">Joined</p>
                  <p className="mt-1 text-[15px] font-semibold text-[#222]">
                    {selectedUser.joined}
                  </p>
                </div>

                <div className="rounded-[14px] bg-[#fff5fa] px-4 py-3">
                  <p className="text-[12px] text-[#ea3f97]">Status</p>
                  <div className="mt-2">
                    <span
                      className={`rounded-full px-3 py-1 text-[12px] font-medium ${getStatusClass(
                        selectedUser.status
                      )}`}
                    >
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedUser(null);
                  }}
                  className="rounded-full bg-[#db2d8d] px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#c8277e]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-[520px] rounded-[24px] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[26px] font-bold text-[#db2d8d]">
                  Edit User
                </h2>
                <p className="mt-1 text-[14px] text-[#777]">
                  Update the selected user information
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f7] text-[18px] text-[#555] transition hover:bg-[#efefef]"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Full name"
                value={editingUser.name}
                onChange={handleEditUserChange}
                className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] placeholder:text-[#9b9b9b] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              />

              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={editingUser.email}
                onChange={handleEditUserChange}
                className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] placeholder:text-[#9b9b9b] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              />

              <input
                type="text"
                name="address"
                placeholder="Address"
                value={editingUser.address}
                onChange={handleEditUserChange}
                className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] placeholder:text-[#9b9b9b] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-[#666]">
                    Status
                  </label>
                  <select
                    name="status"
                    value={editingUser.status}
                    onChange={handleEditUserChange}
                    className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-medium text-[#666]">
                    Role
                  </label>
                  <div className="flex h-[48px] items-center rounded-[14px] border border-[#e6e6e6] bg-[#fafafa] px-4 text-[14px] text-[#666]">
                    {editingUser.role}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleDeleteUser(editingUser.id)}
                  className="rounded-full bg-[#f3f3f3] px-5 py-2.5 text-[14px] font-medium text-[#666] transition hover:bg-[#ebebeb]"
                >
                  Delete User
                </button>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingUser(null);
                    }}
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
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}