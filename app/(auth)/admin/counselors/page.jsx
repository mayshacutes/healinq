"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

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
  return "bg-[#fff0d9] text-[#d68a1f]";
}

export default function AdminCounselorsPage() {
  const dropdownRef = useRef(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [counselors, setCounselors] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [editingCounselor, setEditingCounselor] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newCounselorForm, setNewCounselorForm] = useState({
    full_name: "",
    email: "",
    password: "",
    specialty: "",
    address: "",
    status: "Pending",
    sessions: 0,
  });

  // Update current date setiap detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch counselors dari Supabase
  const fetchCounselors = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("counselors")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch error:", error);
        setActionMessage(`Error: ${error.message}`);
        return;
      }

      console.log("Fetched counselors:", data?.length || 0);
      setCounselors(data || []);
    } catch (error) {
      console.error("Unexpected error:", error);
      setActionMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCounselors();
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsStatusOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto dismiss action message
  useEffect(() => {
    if (!actionMessage) return;
    const timer = setTimeout(() => setActionMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [actionMessage]);

  // Filter counselors berdasarkan search dan status
  const filteredCounselors = useMemo(() => {
    return counselors.filter((counselor) => {
      const matchSearch =
        (counselor.name || counselor.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (counselor.email || "").toLowerCase().includes(search.toLowerCase()) ||
        (counselor.address || counselor.location || "").toLowerCase().includes(search.toLowerCase()) ||
        (counselor.specialty || counselor.specialization || "").toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "All" ? true : counselor.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [counselors, search, statusFilter]);

  // Statistik
  const totalCounselors = counselors.length;
  const activeCounselors = counselors.filter((c) => c.status === "Active").length;
  const inactiveCounselors = counselors.filter((c) => c.status === "Inactive").length;
  const pendingCounselors = counselors.filter((c) => c.status === "Pending").length;

  // Handle form change
  const handleNewCounselorChange = (e) => {
    const { name, value } = e.target;
    setNewCounselorForm((prev) => ({
      ...prev,
      [name]: name === "sessions" ? Number(value) : value,
    }));
  };

  // ADD COUNSELOR - Insert ke profiles DAN counselors sekaligus
  const handleAddCounselor = async (e) => {
    e.preventDefault();

    if (!newCounselorForm.full_name.trim() || !newCounselorForm.email.trim()) {
      setActionMessage("Please complete name and email first.");
      return;
    }

    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newCounselorForm.email)) {
      setActionMessage("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setActionMessage("Saving counselor...");

    try {
      console.log("NEW COUNSELOR FORM:", newCounselorForm);
      const response = await fetch(
        "/api/admin/create-counselor",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newCounselorForm),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setActionMessage(
          result.message || "Failed to create counselor."
        );
        return;
      }

      await fetchCounselors();

      setShowAddModal(false);

      setNewCounselorForm({
        full_name: "",
        email: "",
        password: "",
        specialty: "",
        address: "",
        status: "Pending",
        sessions: 0,
      });

      setActionMessage(
        "✅ Counselor created successfully!"
      );
    }
    catch (error) {
      console.error(error);

      setActionMessage(
        error.message || "Unexpected error."
      );
    }
    finally {
      setIsLoading(false);
    }
  };

  // EXPORT DATA
  const handleExportData = () => {
    if (filteredCounselors.length === 0) {
      setActionMessage("No data to export.");
      return;
    }

    const rows = [
      ["Name", "Email", "Specialty", "Address", "Joined", "Status", "Sessions", "Role"],
      ...filteredCounselors.map((c) => [
        c.name || c.full_name,
        c.email,
        c.specialty || c.specialization,
        c.address || c.location,
        c.created_at ? formatJoinDate(new Date(c.created_at)) : "-",
        c.status,
        c.sessions || 0,
        "counselor",
      ]),
    ];

    const csvContent = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `counselors-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setActionMessage("✅ Data exported successfully!");
  };

  // FILTER ACTIVE
  const handleFilterActive = () => {
    setStatusFilter("Active");
    setIsStatusOpen(false);
    setActionMessage("Showing active counselors only.");
  };

  // FILTER PENDING
  const handleReviewPending = () => {
    setStatusFilter("Pending");
    setIsStatusOpen(false);
    setActionMessage("Showing pending counselors only.");
  };

  // VIEW COUNSELOR
  const handleViewCounselor = (counselor) => {
    setSelectedCounselor(counselor);
    setShowViewModal(true);
  };

  // OPEN EDIT MODAL
  const handleOpenEditCounselor = (counselor) => {
    setEditingCounselor({ ...counselor });
    setShowEditModal(true);
  };

  // EDIT FORM CHANGE
  const handleEditCounselorChange = (e) => {
    const { name, value } = e.target;
    setEditingCounselor((prev) => ({
      ...prev,
      [name]: name === "sessions" ? Number(value) : value,
    }));
  };

  // SAVE EDIT - Update ke kedua tabel
  const handleSaveEditCounselor = async (e) => {
    e.preventDefault();

    if (!editingCounselor.name?.trim() && !editingCounselor.full_name?.trim()) {
      setActionMessage("Please complete all fields first.");
      return;
    }

    setIsLoading(true);
    setActionMessage("Updating counselor...");

    try {
      const updateData = {
        name: editingCounselor.name || editingCounselor.full_name,
        email: editingCounselor.email?.trim().toLowerCase(),
        specialty: editingCounselor.specialty?.trim(),
        specialization: editingCounselor.specialty?.trim(),
        address: editingCounselor.address?.trim(),
        location: editingCounselor.address?.trim(),
        status: editingCounselor.status,
        sessions: Number(editingCounselor.sessions) || 0,
      };

      // Update counselors table
      const { error: counselorError } = await supabase
        .from("counselors")
        .update(updateData)
        .eq("id", editingCounselor.id);

      if (counselorError) {
        console.error("Update error on counselors:", counselorError);
        setActionMessage(`Error: ${counselorError.message}`);
        return;
      }

      // Update profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: editingCounselor.name || editingCounselor.full_name,
          email: editingCounselor.email?.trim().toLowerCase(),
          specialty: editingCounselor.specialty?.trim(),
          address: editingCounselor.address?.trim(),
          status: editingCounselor.status,
          sessions: Number(editingCounselor.sessions) || 0,
        })
        .eq("id", editingCounselor.id);

      if (profileError) {
        console.error("Update error on profiles:", profileError);
        setActionMessage(`Error updating profile: ${profileError.message}`);
        return;
      }

      await fetchCounselors();
      setActionMessage("✅ Counselor updated successfully!");
      setShowEditModal(false);
      setEditingCounselor(null);
    } catch (error) {
      console.error("Unexpected error:", error);
      setActionMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // DELETE COUNSELOR - Hapus dari kedua tabel
  const handleDeleteCounselor = async (counselorId) => {
    const confirmed = window.confirm("Are you sure you want to delete this counselor?");
    if (!confirmed) return;

    setIsLoading(true);
    setActionMessage("Deleting counselor...");

    try {
      // Hapus dari counselors table
      const { error: counselorError } = await supabase
        .from("counselors")
        .delete()
        .eq("id", counselorId);

      if (counselorError) {
        console.error("Delete error from counselors:", counselorError);
        setActionMessage(`Error: ${counselorError.message}`);
        return;
      }

      // Hapus dari profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", counselorId);

      if (profileError) {
        console.error("Delete error from profiles:", profileError);
        setActionMessage(`Error: ${profileError.message}`);
        return;
      }

      await fetchCounselors();
      setActionMessage("✅ Counselor deleted successfully!");

      if (selectedCounselor?.id === counselorId) {
        setShowViewModal(false);
        setSelectedCounselor(null);
      }
      if (editingCounselor?.id === counselorId) {
        setShowEditModal(false);
        setEditingCounselor(null);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setActionMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading && counselors.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#d9edf8]">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#db2d8d] border-t-transparent"></div>
          <p className="text-[#e1268d]">Loading counselors...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#d9edf8]">
      {/* Background decoration */}
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
          {/* Header */}
          <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-[34px] font-bold leading-none text-[#e1268d] sm:text-[42px]">Counselor Management</h1>
              <p className="mt-2 text-[18px] text-[#f08bbf]">Manage counselor accounts, specialties, and status details</p>
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

          {/* Stat Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[18px] bg-[#bde6e5]/85 px-5 py-5 shadow">
              <p className="text-[14px] text-[#ea3f97]">Total Counselors</p>
              <h3 className="mt-2 text-[28px] font-bold text-[#0c72a6]">{totalCounselors}</h3>
            </div>
            <div className="rounded-[18px] bg-[#bde6e5]/85 px-5 py-5 shadow">
              <p className="text-[14px] text-[#ea3f97]">Active Counselors</p>
              <h3 className="mt-2 text-[28px] font-bold text-[#0c72a6]">{activeCounselors}</h3>
            </div>
            <div className="rounded-[18px] bg-[#bde6e5]/85 px-5 py-5 shadow">
              <p className="text-[14px] text-[#ea3f97]">Inactive Counselors</p>
              <h3 className="mt-2 text-[28px] font-bold text-[#0c72a6]">{inactiveCounselors}</h3>
            </div>
            <div className="rounded-[18px] bg-[#bde6e5]/85 px-5 py-5 shadow">
              <p className="text-[14px] text-[#ea3f97]">Pending Counselors</p>
              <h3 className="mt-2 text-[28px] font-bold text-[#0c72a6]">{pendingCounselors}</h3>
            </div>
          </div>

          {/* Counselor Directory Table */}
          <div className="mb-6 rounded-[20px] bg-white/85 p-5 shadow">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-[18px] font-bold text-[#1e1e1e]">Counselor Directory</h2>
                <p className="mt-1 text-[12px] text-[#5c5c5c]">Search and manage all registered counselors</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  placeholder="Search counselor, email, specialty..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-[44px] min-w-[260px] rounded-full border border-[#e6e6e6] bg-white px-4 text-[14px] text-[#333] placeholder:text-[#9b9b9b] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
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
                    <span className="ml-3 shrink-0 text-[12px] text-[#666]">▼</span>
                  </button>
                  {isStatusOpen && (
                    <div className="absolute right-0 z-20 mt-2 w-full overflow-hidden rounded-[18px] border border-[#f0d8e5] bg-white shadow">
                      {["All", "Active", "Inactive", "Pending"].map((status) => (
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
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">Name</th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">Email</th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">Specialty</th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">Address</th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">Joined</th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">Status</th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCounselors.map((counselor) => (
                    <tr key={counselor.id} className="border-b border-[#f2f2f2] hover:bg-[#f9f9f9]">
                      <td className="px-4 py-4 text-[14px] font-medium text-[#262626]">{counselor.name || counselor.full_name}</td>
                      <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">{counselor.email}</td>
                      <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">{counselor.specialty || counselor.specialization}</td>
                      <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">{counselor.address || counselor.location}</td>
                      <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">
                        {counselor.created_at ? formatJoinDate(new Date(counselor.created_at)) : "-"}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-[12px] font-medium ${getStatusClass(counselor.status)}`}>
                          {counselor.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => handleViewCounselor(counselor)} className="rounded-full bg-[#dff1ff] px-3 py-1.5 text-[12px] font-medium text-[#0c72a6] transition hover:opacity-90">View</button>
                          <button onClick={() => handleOpenEditCounselor(counselor)} className="rounded-full bg-[#ffe7f1] px-3 py-1.5 text-[12px] font-medium text-[#db2d8d] transition hover:opacity-90">Edit</button>
                          <button onClick={() => handleDeleteCounselor(counselor.id)} className="rounded-full bg-[#f3f3f3] px-3 py-1.5 text-[12px] font-medium text-[#666] transition hover:opacity-90">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCounselors.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-[14px] text-[#7a7a7a]">No counselors found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Insights & Quick Actions */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div className="rounded-[20px] bg-[#e7daf0]/85 p-5 shadow">
              <h2 className="text-[18px] font-bold text-[#1e1e1e]">Counselor Insights</h2>
              <div className="mt-5 space-y-4">
                <div className="rounded-[14px] bg-white/50 px-4 py-4">
                  <p className="text-[13px] text-[#ea3f97]">Top specialty</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#222]">Anxiety</p>
                </div>
                <div className="rounded-[14px] bg-white/50 px-4 py-4">
                  <p className="text-[13px] text-[#ea3f97]">Most active counselor</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#222]">
                    {[...counselors].sort((a, b) => (b.sessions || 0) - (a.sessions || 0))[0]?.name || "-"}
                  </p>
                </div>
                <div className="rounded-[14px] bg-white/50 px-4 py-4">
                  <p className="text-[13px] text-[#ea3f97]">Default role</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#222]">Counselor</p>
                </div>
              </div>
            </div>

            <div className="rounded-[20px] bg-[#bde6e5]/85 p-5 shadow">
              <h2 className="text-[18px] font-bold text-[#1e1e1e]">Quick Actions</h2>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button onClick={() => setShowAddModal(true)} className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80">
                  <p className="text-[15px] font-semibold text-[#db2d8d]">Add Counselor</p>
                  <p className="mt-1 text-[12px] text-[#666]">Create a new counselor account</p>
                </button>
                <button onClick={handleExportData} className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80">
                  <p className="text-[15px] font-semibold text-[#db2d8d]">Export Data</p>
                  <p className="mt-1 text-[12px] text-[#666]">Download counselor records</p>
                </button>
                <button onClick={handleFilterActive} className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80">
                  <p className="text-[15px] font-semibold text-[#db2d8d]">Filter Active</p>
                  <p className="mt-1 text-[12px] text-[#666]">Show only active counselors</p>
                </button>
                <button onClick={handleReviewPending} className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80">
                  <p className="text-[15px] font-semibold text-[#db2d8d]">Review Pending</p>
                  <p className="mt-1 text-[12px] text-[#666]">Check pending counselor accounts</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ADD COUNSELOR MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-[560px] rounded-[24px] bg-white p-6 shadow">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[26px] font-bold text-[#db2d8d]">Add New Counselor</h2>
                <p className="mt-1 text-[14px] text-[#777]">Fill in the counselor information below</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f7] text-[18px] text-[#555] transition hover:bg-[#efefef]">×</button>
            </div>
            <form onSubmit={handleAddCounselor} className="space-y-4">
              <input type="text" name="full_name" placeholder="Full name" value={newCounselorForm.full_name} onChange={handleNewCounselorChange} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20" />
              <input type="email" name="email" placeholder="Email address" value={newCounselorForm.email} onChange={handleNewCounselorChange} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20" />
              <input
                type="password"
                name="password"
                placeholder="Temporary Password"
                value={newCounselorForm.password}
                onChange={handleNewCounselorChange}
                className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4"
              />
              <input type="text" name="specialty" placeholder="Specialty" value={newCounselorForm.specialty} onChange={handleNewCounselorChange} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20" />
              <input type="text" name="address" placeholder="Address" value={newCounselorForm.address} onChange={handleNewCounselorChange} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-[#666]">Status</label>
                  <select name="status" value={newCounselorForm.status} onChange={handleNewCounselorChange} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20">
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-[#666]">Sessions</label>
                  <input type="number" min="0" name="sessions" value={newCounselorForm.sessions} onChange={handleNewCounselorChange} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20" />
                </div>
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-[#666]">Role</label>
                  <div className="flex h-[48px] items-center rounded-[14px] border border-[#e6e6e6] bg-[#fafafa] px-4 text-[14px] text-[#666]">Counselor</div>
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="rounded-full border border-[#d8d8d8] bg-white px-5 py-2.5 text-[14px] font-medium text-[#555] transition hover:bg-[#f8f8f8]">Cancel</button>
                <button type="submit" disabled={isLoading} className="rounded-full bg-[#db2d8d] px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#c8277e] disabled:opacity-50">
                  {isLoading ? "Saving..." : "Save Counselor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW COUNSELOR MODAL */}
      {showViewModal && selectedCounselor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-[500px] rounded-[24px] bg-white p-6 shadow">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[26px] font-bold text-[#db2d8d]">Counselor Detail</h2>
                <p className="mt-1 text-[14px] text-[#777]">Detailed information for this counselor</p>
              </div>
              <button onClick={() => { setShowViewModal(false); setSelectedCounselor(null); }} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f7] text-[18px]">×</button>
            </div>
            <div className="space-y-4">
              <div className="rounded-[14px] bg-[#fff5fa] px-4 py-3">
                <p className="text-[12px] text-[#ea3f97]">Full Name</p>
                <p className="mt-1 text-[15px] font-semibold text-[#222]">{selectedCounselor.name || selectedCounselor.full_name}</p>
              </div>
              <div className="rounded-[14px] bg-[#f4fbff] px-4 py-3">
                <p className="text-[12px] text-[#0c72a6]">Email</p>
                <p className="mt-1 text-[15px] font-semibold text-[#222]">{selectedCounselor.email}</p>
              </div>
              <div className="rounded-[14px] bg-[#fff5fa] px-4 py-3">
                <p className="text-[12px] text-[#ea3f97]">Specialty</p>
                <p className="mt-1 text-[15px] font-semibold text-[#222]">{selectedCounselor.specialty || selectedCounselor.specialization}</p>
              </div>
              <div className="rounded-[14px] bg-[#f4fbff] px-4 py-3">
                <p className="text-[12px] text-[#0c72a6]">Address</p>
                <p className="mt-1 text-[15px] font-semibold text-[#222]">{selectedCounselor.address || selectedCounselor.location}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-[14px] bg-[#fff5fa] px-4 py-3">
                  <p className="text-[12px] text-[#ea3f97]">Joined</p>
                  <p className="mt-1 text-[15px] font-semibold text-[#222]">
                    {selectedCounselor.created_at ? formatJoinDate(new Date(selectedCounselor.created_at)) : "-"}
                  </p>
                </div>
                <div className="rounded-[14px] bg-[#f4fbff] px-4 py-3">
                  <p className="text-[12px] text-[#0c72a6]">Sessions</p>
                  <p className="mt-1 text-[15px] font-semibold text-[#222]">{selectedCounselor.sessions || 0}</p>
                </div>
                <div className="rounded-[14px] bg-[#fff5fa] px-4 py-3">
                  <p className="text-[12px] text-[#ea3f97]">Status</p>
                  <div className="mt-2">
                    <span className={`rounded-full px-3 py-1 text-[12px] font-medium ${getStatusClass(selectedCounselor.status)}`}>
                      {selectedCounselor.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={() => { setShowViewModal(false); setSelectedCounselor(null); }} className="rounded-full bg-[#db2d8d] px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#c8277e]">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT COUNSELOR MODAL */}
      {showEditModal && editingCounselor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-[560px] rounded-[24px] bg-white p-6 shadow">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[26px] font-bold text-[#db2d8d]">Edit Counselor</h2>
                <p className="mt-1 text-[14px] text-[#777]">Update the selected counselor information</p>
              </div>
              <button onClick={() => { setShowEditModal(false); setEditingCounselor(null); }} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f7] text-[18px]">×</button>
            </div>
            <form onSubmit={handleSaveEditCounselor} className="space-y-4">
              <input type="text" name="name" placeholder="Full name" value={editingCounselor.name || editingCounselor.full_name || ""} onChange={handleEditCounselorChange} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20" />
              <input type="email" name="email" placeholder="Email address" value={editingCounselor.email || ""} onChange={handleEditCounselorChange} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20" />
              <input type="text" name="specialty" placeholder="Specialty" value={editingCounselor.specialty || editingCounselor.specialization || ""} onChange={handleEditCounselorChange} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20" />
              <input type="text" name="address" placeholder="Address" value={editingCounselor.address || editingCounselor.location || ""} onChange={handleEditCounselorChange} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-[#666]">Status</label>
                  <select name="status" value={editingCounselor.status || "Pending"} onChange={handleEditCounselorChange} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-[#666]">Sessions</label>
                  <input type="number" min="0" name="sessions" value={editingCounselor.sessions || 0} onChange={handleEditCounselorChange} className="h-[48px] w-full rounded-[14px] border border-[#e6e6e6] px-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20" />
                </div>
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-[#666]">Role</label>
                  <div className="flex h-[48px] items-center rounded-[14px] border border-[#e6e6e6] bg-[#fafafa] px-4 text-[14px] text-[#666]">Counselor</div>
                </div>
              </div>
              <div className="flex flex-wrap justify-between gap-3 pt-2">
                <button type="button" onClick={() => handleDeleteCounselor(editingCounselor.id)} className="rounded-full bg-[#f3f3f3] px-5 py-2.5 text-[14px] font-medium text-[#666] transition hover:bg-[#ebebeb]">Delete Counselor</button>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => { setShowEditModal(false); setEditingCounselor(null); }} className="rounded-full border border-[#d8d8d8] bg-white px-5 py-2.5 text-[14px] font-medium text-[#555] transition hover:bg-[#f8f8f8]">Cancel</button>
                  <button type="submit" disabled={isLoading} className="rounded-full bg-[#db2d8d] px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#c8277e] disabled:opacity-50">
                    {isLoading ? "Saving..." : "Save Changes"}
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