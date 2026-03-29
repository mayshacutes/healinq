"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const initialActivities = [
  {
    id: 1,
    actor: "Alya Putri",
    role: "User",
    action: "Created a new journal entry",
    category: "Self-Healing",
    date: "Mar 28, 2026",
    time: "09:15 AM",
    status: "Completed",
    description:
      "The user created a new journal entry in the self-healing section.",
  },
  {
    id: 2,
    actor: "Dr. Aulia Rahman",
    role: "Counselor",
    action: "Completed a counseling session",
    category: "Consultation",
    date: "Mar 28, 2026",
    time: "11:30 AM",
    status: "Completed",
    description:
      "The counselor completed a scheduled counseling session with a user.",
  },
  {
    id: 3,
    actor: "Admin",
    role: "Admin",
    action: "Updated counselor profile",
    category: "Management",
    date: "Mar 27, 2026",
    time: "02:40 PM",
    status: "Completed",
    description:
      "The admin updated counselor information in the management panel.",
  },
  {
    id: 4,
    actor: "Nadhif Ramadhan",
    role: "User",
    action: "Payment is still pending",
    category: "Transactions",
    date: "Mar 27, 2026",
    time: "04:10 PM",
    status: "Pending",
    description:
      "The user's payment transaction is pending verification.",
  },
  {
    id: 5,
    actor: "System",
    role: "System",
    action: "Failed payment notification sent",
    category: "Transactions",
    date: "Mar 26, 2026",
    time: "08:20 PM",
    status: "Failed",
    description:
      "The system sent a failed payment notification to the user.",
  },
  {
    id: 6,
    actor: "Dr. Nabila Putri",
    role: "Counselor",
    action: "Updated availability schedule",
    category: "Counselors",
    date: "Mar 26, 2026",
    time: "01:00 PM",
    status: "Completed",
    description:
      "The counselor updated her weekly availability for future sessions.",
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

function getStatusClass(status) {
  if (status === "Completed") {
    return "bg-[#dff7eb] text-[#1f9d62]";
  }
  if (status === "Pending") {
    return "bg-[#fff0d9] text-[#d68a1f]";
  }
  return "bg-[#ffe1ea] text-[#d64b7f]";
}

export default function AdminActivityPage() {
  const pathname = usePathname();
  const dropdownRef = useRef(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [activities] = useState(initialActivities);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

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

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchSearch =
        activity.actor.toLowerCase().includes(search.toLowerCase()) ||
        activity.action.toLowerCase().includes(search.toLowerCase()) ||
        activity.category.toLowerCase().includes(search.toLowerCase()) ||
        activity.role.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "All" ? true : activity.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [activities, search, statusFilter]);

  const totalActivities = activities.length;
  const completedActivities = activities.filter(
    (activity) => activity.status === "Completed"
  ).length;
  const pendingActivities = activities.filter(
    (activity) => activity.status === "Pending"
  ).length;
  const failedActivities = activities.filter(
    (activity) => activity.status === "Failed"
  ).length;

  const handleExportData = () => {
    const rows = [
      [
        "Actor",
        "Role",
        "Action",
        "Category",
        "Date",
        "Time",
        "Status",
        "Description",
      ],
      ...filteredActivities.map((activity) => [
        activity.actor,
        activity.role,
        activity.action,
        activity.category,
        activity.date,
        activity.time,
        activity.status,
        activity.description,
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
    link.setAttribute("download", "activity-log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setActionMessage("Activity data exported successfully.");
  };

  const handleFilterCompleted = () => {
    setStatusFilter("Completed");
    setIsStatusOpen(false);
    setActionMessage("Showing completed activities only.");
  };

  const handleFilterPending = () => {
    setStatusFilter("Pending");
    setIsStatusOpen(false);
    setActionMessage("Showing pending activities only.");
  };

  const handleResetFilters = () => {
    setStatusFilter("All");
    setSearch("");
    setActionMessage("All filters have been reset.");
  };

  const handleViewActivity = (activity) => {
    setSelectedActivity(activity);
    setShowViewModal(true);
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
                  Activity Log
                </h1>
                <p className="mt-2 text-[18px] text-[#f08bbf]">
                  Monitor recent actions, updates, and platform events
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
                <p className="text-[14px] text-[#ea3f97]">Total Activities</p>
                <h3 className="mt-2 text-[28px] font-bold text-[#0c72a6]">
                  {totalActivities}
                </h3>
              </div>

              <div className="rounded-[18px] bg-[#bde6e5]/85 px-5 py-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                <p className="text-[14px] text-[#ea3f97]">Completed</p>
                <h3 className="mt-2 text-[28px] font-bold text-[#0c72a6]">
                  {completedActivities}
                </h3>
              </div>

              <div className="rounded-[18px] bg-[#bde6e5]/85 px-5 py-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                <p className="text-[14px] text-[#ea3f97]">Pending</p>
                <h3 className="mt-2 text-[28px] font-bold text-[#0c72a6]">
                  {pendingActivities}
                </h3>
              </div>

              <div className="rounded-[18px] bg-[#bde6e5]/85 px-5 py-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                <p className="text-[14px] text-[#ea3f97]">Failed</p>
                <h3 className="mt-2 text-[28px] font-bold text-[#0c72a6]">
                  {failedActivities}
                </h3>
              </div>
            </div>

            <div className="mb-6 rounded-[20px] bg-white/85 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-[18px] font-bold text-[#1e1e1e]">
                    Activity Directory
                  </h2>
                  <p className="mt-1 text-[12px] text-[#5c5c5c]">
                    Search and review all recorded platform activities
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    placeholder="Search actor, action, or category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-[44px] min-w-[280px] rounded-full border border-[#e6e6e6] bg-white px-4 text-[14px] text-[#333] placeholder:text-[#9b9b9b] focus:outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
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
                        {["All", "Completed", "Pending", "Failed"].map((status) => (
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

                  <button
                    type="button"
                    onClick={handleExportData}
                    className="h-[44px] rounded-full bg-[#db2d8d] px-5 text-[14px] font-medium text-white transition hover:bg-[#c8277e]"
                  >
                    Export
                  </button>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[1050px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#ea3f97]">
                      <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">
                        Actor
                      </th>
                      <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">
                        Action
                      </th>
                      <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">
                        Date
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
                    {filteredActivities.map((activity) => (
                      <tr
                        key={activity.id}
                        className="border-b border-[#f2f2f2] last:border-b-0"
                      >
                        <td className="px-4 py-4 text-[14px] font-medium text-[#262626]">
                          {activity.actor}
                        </td>
                        <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">
                          {activity.role}
                        </td>
                        <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">
                          {activity.action}
                        </td>
                        <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">
                          {activity.category}
                        </td>
                        <td className="px-4 py-4 text-[14px] text-[#5f5f5f]">
                          {activity.date}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-[12px] font-medium ${getStatusClass(
                              activity.status
                            )}`}
                          >
                            {activity.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => handleViewActivity(activity)}
                            className="rounded-full bg-[#dff1ff] px-3 py-1.5 text-[12px] font-medium text-[#0c72a6] transition hover:opacity-90"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredActivities.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-10 text-center text-[14px] text-[#7a7a7a]"
                        >
                          No activities found.
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
                  Activity Insights
                </h2>

                <div className="mt-5 space-y-4">
                  <div className="rounded-[14px] bg-white/50 px-4 py-4">
                    <p className="text-[13px] text-[#ea3f97]">Most active role</p>
                    <p className="mt-1 text-[16px] font-semibold text-[#222]">
                      User
                    </p>
                  </div>

                  <div className="rounded-[14px] bg-white/50 px-4 py-4">
                    <p className="text-[13px] text-[#ea3f97]">Most recent event</p>
                    <p className="mt-1 text-[16px] font-semibold text-[#222]">
                      {activities[0]?.action || "-"}
                    </p>
                  </div>

                  <div className="rounded-[14px] bg-white/50 px-4 py-4">
                    <p className="text-[13px] text-[#ea3f97]">Most common status</p>
                    <p className="mt-1 text-[16px] font-semibold text-[#222]">
                      {completedActivities >= pendingActivities &&
                      completedActivities >= failedActivities
                        ? "Completed"
                        : pendingActivities >= failedActivities
                        ? "Pending"
                        : "Failed"}
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
                    onClick={handleExportData}
                    className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80"
                  >
                    <p className="text-[15px] font-semibold text-[#db2d8d]">
                      Export Data
                    </p>
                    <p className="mt-1 text-[12px] text-[#666]">
                      Download activity records
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={handleFilterCompleted}
                    className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80"
                  >
                    <p className="text-[15px] font-semibold text-[#db2d8d]">
                      Show Completed
                    </p>
                    <p className="mt-1 text-[12px] text-[#666]">
                      Filter completed activities only
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={handleFilterPending}
                    className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80"
                  >
                    <p className="text-[15px] font-semibold text-[#db2d8d]">
                      Review Pending
                    </p>
                    <p className="mt-1 text-[12px] text-[#666]">
                      Check activities with pending status
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="rounded-[14px] bg-white/60 px-4 py-4 text-left transition hover:bg-white/80"
                  >
                    <p className="text-[15px] font-semibold text-[#db2d8d]">
                      Reset Filters
                    </p>
                    <p className="mt-1 text-[12px] text-[#666]">
                      Show all activity records again
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {showViewModal && selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-[520px] rounded-[24px] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[26px] font-bold text-[#db2d8d]">
                  Activity Detail
                </h2>
                <p className="mt-1 text-[14px] text-[#777]">
                  Detailed information for this activity log
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedActivity(null);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f7] text-[18px] text-[#555] transition hover:bg-[#efefef]"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-[14px] bg-[#fff5fa] px-4 py-3">
                <p className="text-[12px] text-[#ea3f97]">Actor</p>
                <p className="mt-1 text-[15px] font-semibold text-[#222]">
                  {selectedActivity.actor}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-[14px] bg-[#f4fbff] px-4 py-3">
                  <p className="text-[12px] text-[#0c72a6]">Role</p>
                  <p className="mt-1 text-[15px] font-semibold text-[#222]">
                    {selectedActivity.role}
                  </p>
                </div>

                <div className="rounded-[14px] bg-[#fff5fa] px-4 py-3">
                  <p className="text-[12px] text-[#ea3f97]">Category</p>
                  <p className="mt-1 text-[15px] font-semibold text-[#222]">
                    {selectedActivity.category}
                  </p>
                </div>
              </div>

              <div className="rounded-[14px] bg-[#f4fbff] px-4 py-3">
                <p className="text-[12px] text-[#0c72a6]">Action</p>
                <p className="mt-1 text-[15px] font-semibold text-[#222]">
                  {selectedActivity.action}
                </p>
              </div>

              <div className="rounded-[14px] bg-[#fff5fa] px-4 py-3">
                <p className="text-[12px] text-[#ea3f97]">Description</p>
                <p className="mt-1 text-[15px] font-semibold text-[#222]">
                  {selectedActivity.description}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-[14px] bg-[#f4fbff] px-4 py-3">
                  <p className="text-[12px] text-[#0c72a6]">Date</p>
                  <p className="mt-1 text-[15px] font-semibold text-[#222]">
                    {selectedActivity.date}
                  </p>
                </div>

                <div className="rounded-[14px] bg-[#fff5fa] px-4 py-3">
                  <p className="text-[12px] text-[#ea3f97]">Time</p>
                  <p className="mt-1 text-[15px] font-semibold text-[#222]">
                    {selectedActivity.time}
                  </p>
                </div>

                <div className="rounded-[14px] bg-[#f4fbff] px-4 py-3">
                  <p className="text-[12px] text-[#0c72a6]">Status</p>
                  <div className="mt-2">
                    <span
                      className={`rounded-full px-3 py-1 text-[12px] font-medium ${getStatusClass(
                        selectedActivity.status
                      )}`}
                    >
                      {selectedActivity.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedActivity(null);
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
    </main>
  );
}