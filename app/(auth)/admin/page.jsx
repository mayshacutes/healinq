"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

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

  useEffect(() => {

    fetchDashboardData();

    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(timer);

  }, []);

  const fetchDashboardData = async () => {

    // =====================================
    // STATS
    // =====================================

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
      {
        title: "Total active users",
        value: totalUsers || 0,
        icon: "/images/icon_users.png",
      },
      {
        title: "Registered counselors",
        value: totalCounselors || 0,
        icon: "/images/icon_counselor.png",
      },
      {
        title: "Consultations",
        value: totalConsultations || 0,
        icon: "/images/icon_calendar.png",
      },
      {
        title: "Total chats",
        value: totalChats || 0,
        icon: "/images/icon_chat.png",
      },
    ]);

    // =====================================
    // NEW USERS
    // =====================================

    const { data: usersData } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "client")
      .order("created_at", { ascending: false })
      .limit(5);

    setNewUsers(usersData || []);

    // =====================================
    // TOP COUNSELORS
    // =====================================

    const { data: consultationData } = await supabase
      .from("consultations")
      .select(`
        counselor_id,
        counselors (
          id,
          profiles (
            full_name
          )
        )
      `);

    const grouped = {};

    consultationData?.forEach((item) => {

      const name =
        item.counselors?.profiles?.full_name;

      if (!name) return;

      if (!grouped[name]) {
        grouped[name] = 0;
      }

      grouped[name]++;
    });

    const ranked = Object.entries(grouped)
      .map(([name, sessions], index) => ({
        id: index + 1,
        name,
        sessions,
      }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 5);

    setTopCounselors(ranked);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#d9edf8]">

      <section className="relative z-10 w-full px-6 pb-6 pt-20">

        <div className="mb-7 flex justify-between items-center">

          <div>
            <h1 className="text-4xl font-bold text-[#e1268d]">
              Dashboard Overview
            </h1>

            <p className="mt-2 text-[#f08bbf]">
              Welcome back! Here’s your overview today
            </p>
          </div>

          <div className="bg-white px-5 py-2 rounded-full">
            {formatTopDate(currentDate)}
          </div>
        </div>

        {/* ================= STATS ================= */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

          {stats.map((item) => (

            <div
              key={item.title}
              className="rounded-xl bg-[#bde6e5] p-5 shadow"
            >

              <Image
                src={item.icon}
                alt={item.title}
                width={36}
                height={36}
                className="mb-4"
              />

              <h2 className="text-2xl font-bold text-[#0c72a6]">
                {item.value}
              </h2>

              <p className="text-[#ea3f97]">
                {item.title}
              </p>
            </div>
          ))}
        </div>

        {/* ================= NEW USERS ================= */}

        <div className="bg-white rounded-xl p-5 shadow mb-6">

          <h2 className="text-xl font-bold mb-4">
            New Users
          </h2>

          <table className="w-full">

            <thead>
              <tr className="border-b">
                <th className="text-left py-3">
                  Name
                </th>

                <th className="text-left py-3">
                  Address
                </th>

                <th className="text-left py-3">
                  Joined
                </th>
              </tr>
            </thead>

            <tbody>

              {newUsers.map((user) => (

                <tr
                  key={user.id}
                  className="border-b"
                >

                  <td className="py-4">
                    {user.full_name}
                  </td>

                  <td className="py-4">
                    {user.address || "-"}
                  </td>

                  <td className="py-4">
                    {new Date(
                      user.created_at
                    ).toLocaleDateString()}
                  </td>

                </tr>
              ))}

            </tbody>

          </table>
        </div>

        {/* ================= TOP COUNSELORS ================= */}

        <div className="bg-[#bde6e5] rounded-xl p-5 shadow">

          <h2 className="text-xl font-bold mb-5">
            Top Counselors
          </h2>

          <div className="space-y-4">

            {topCounselors.map((counselor, index) => (

              <div
                key={index}
                className="bg-white rounded-xl px-4 py-3 flex justify-between"
              >

                <div className="flex items-center gap-3">

                  <div className="w-8 h-8 rounded-full bg-pink-300 flex items-center justify-center text-white">
                    {index + 1}
                  </div>

                  <span>
                    {counselor.name}
                  </span>
                </div>

                <span className="text-[#0c72a6]">
                  {counselor.sessions} sessions
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}