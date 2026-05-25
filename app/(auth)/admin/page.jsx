"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

function formatTopDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function AdminDashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [stats, setStats] = useState([]);
  const [newUsers, setNewUsers] = useState([]);
  const [topCounselors, setTopCounselors] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [consultationTypeData, setConsultationTypeData] = useState([]);
  const [topCounselorsChart, setTopCounselorsChart] = useState([]);
  const [paymentStatusData, setPaymentStatusData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    // Stats counts
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });
    const { count: totalCounselors } = await supabase
      .from("counselors")
      .select("*", { count: "exact", head: true });
    const { count: totalConsultations } = await supabase
      .from("consultations")
      .select("*", { count: "exact", head: true });
    const { count: totalChats } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true });

    setStats([
      { title: "Total active users", value: totalUsers || 0, icon: "/images/icon_users.png" },
      { title: "Registered counselors", value: totalCounselors || 0, icon: "/images/icon_counselor.png" },
      { title: "Consultations", value: totalConsultations || 0, icon: "/images/icon_calendar.png" },
      { title: "Total chats", value: totalChats || 0, icon: "/images/icon_chat.png" },
    ]);

    // User growth (monthly)
    const { data: growthUsers } = await supabase.from("profiles").select("created_at");
    const monthlyUsers = {};
    growthUsers?.forEach((user) => {
      const month = new Date(user.created_at).toLocaleString("default", { month: "short" });
      monthlyUsers[month] = (monthlyUsers[month] || 0) + 1;
    });
    setUserGrowthData(Object.keys(monthlyUsers).map((month) => ({ month, users: monthlyUsers[month] })));

    // Consultation type
    const { data: consultationTypes } = await supabase.from("consultations").select("consultation_type");
    const onlineCount = consultationTypes?.filter((c) => c.consultation_type === "online").length || 0;
    const offlineCount = consultationTypes?.filter((c) => c.consultation_type === "offline").length || 0;
    setConsultationTypeData([
      { name: "Online", value: onlineCount, color: "#0c72a6" },
      { name: "Offline", value: offlineCount, color: "#ef7bbf" },
    ]);

    // Top counselors (by sessions from counselors table)
    const { data: counselorsData } = await supabase
      .from("counselors")
      .select("name, sessions")
      .order("sessions", { ascending: false })
      .limit(5);
    setTopCounselorsChart(counselorsData?.map((c) => ({ name: c.name || "Counselor", sessions: c.sessions || 0 })) || []);

    // Payment status
    const { data: paymentsData } = await supabase.from("payments").select("payment_status");
    const success = paymentsData?.filter((p) => p.payment_status === "success").length || 0;
    const pending = paymentsData?.filter((p) => p.payment_status === "pending").length || 0;
    const failed = paymentsData?.filter((p) => p.payment_status === "failed").length || 0;
    setPaymentStatusData([
      { name: "Success", value: success, color: "#4ade80" },
      { name: "Pending", value: pending, color: "#facc15" },
      { name: "Failed", value: failed, color: "#f87171" },
    ]);

    // Newest users
    const { data: newestUsers } = await supabase
      .from("profiles")
      .select("username, address, created_at")
      .order("created_at", { ascending: false })
      .limit(5);
    setNewUsers(newestUsers || []);

    // Top counselors by consultation count (from consultations join)
    const { data: consultationData } = await supabase.from("consultations").select(`
      counselor_id,
      counselors (
        id,
        profiles ( full_name )
      )
    `);
    const grouped = {};
    consultationData?.forEach((item) => {
      const name = item.counselors?.profiles?.full_name;
      if (name) grouped[name] = (grouped[name] || 0) + 1;
    });
    const ranked = Object.entries(grouped)
      .map(([name, sessions], idx) => ({ id: idx + 1, name, sessions }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 5);
    setTopCounselors(ranked);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#d9edf8]">
      {/* Background blur circles + header image (sama persis dengan contoh) */}
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
          {/* Header */}
          <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-[34px] font-bold leading-none text-[#e1268d] sm:text-[42px]">
                Dashboard Overview
              </h1>
              <p className="mt-2 text-[18px] text-[#f08bbf]">
                Welcome back! Here’s your overview today
              </p>
            </div>
            <div className="w-fit rounded-full bg-white px-5 py-2 text-[15px] font-medium text-[#e85fa7] shadow-sm">
              {formatTopDate(currentDate)}
            </div>
          </div>

          {/* Stats cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => (
              <div key={item.title} className="rounded-[18px] bg-[#bde6e5]/85 px-5 py-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                <Image src={item.icon} alt={item.title} width={36} height={36} className="mb-4" />
                <h3 className="text-[28px] font-bold text-[#0c72a6]">{item.value}</h3>
                <p className="text-[14px] text-[#ea3f97]">{item.title}</p>
              </div>
            ))}
          </div>

          {/* Charts grid */}
          <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* User Growth Line Chart */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-black">User Growth</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#0c72a6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Consultation Type Pie */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-black">Online vs Offline Consultation</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={consultationTypeData} dataKey="value" nameKey="name" outerRadius={100} label>
                      {consultationTypeData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Counselors Bar Chart */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-black">Top Counselors by Sessions</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topCounselorsChart} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip />
                    <Bar dataKey="sessions" fill="#ef7bbf" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Payment Status Pie */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-black">Payment Status</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={paymentStatusData} dataKey="value" nameKey="name" outerRadius={100} label>
                      {paymentStatusData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* New Users Table (dengan styling tabel contoh) */}
          <div className="rounded-[20px] bg-[#bde6e5] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
            <h2 className="text-xl font-bold mb-4 text-black">New Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#ea3f97]">
                    <th className="py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">Name</th>
                    <th className="py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">Address</th>
                    <th className="py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#ea3f97]">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {newUsers.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="py-4 text-center text-sm text-gray-500">No new users.</td>
                    </tr>
                  ) : (
                    newUsers.map((user, idx) => (
                      <tr key={idx} className="border-b border-[#000000] last:border-0">
                        <td className="py-3 text-[14px]">{user.username || "-"}</td>
                        <td className="py-3 text-[14px]">{user.address || "-"}</td>
                        <td className="py-3 text-[14px]">{new Date(user.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}