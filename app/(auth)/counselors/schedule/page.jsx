"use client";

import { useEffect, useState } from "react";
import { logActivity } from "@/lib/activityLogger";
import { supabase } from "@/lib/supabaseClient";
import { Icon } from "@iconify/react";

function splitIntoHourlySlots(startTime, endTime) {
  const slots = [];
  let [h] = startTime.split(":").map(Number);
  const [endH] = endTime.split(":").map(Number);
  while (h < endH) {
    slots.push(`${String(h).padStart(2, "0")}.00`);
    h += 1;
  }
  return slots;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function CounselorSchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");
  const [counselorProfile, setCounselorProfile] = useState(null);
  const [counselorData, setCounselorData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [bookedSlotsMap, setBookedSlotsMap] = useState({});
  const [filterTab, setFilterTab] = useState("all");

  const [form, setForm] = useState({
    scheduleDate: "",
    startTime: "",
    endTime: "",
    mode: "online",
  });

  // Cek session user
  useEffect(() => {
    const checkUser = async () => {
      setIsPageLoading(true);
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          setActionMessage("Please login first to access this page.");
          setIsPageLoading(false);
          return;
        }
        setIsLoggedIn(true);

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          setActionMessage(`Error: ${profileError.message}`);
          setIsPageLoading(false);
          return;
        }

        if (!profileData) {
          setActionMessage("Profile not found. Please complete your profile first.");
          setIsPageLoading(false);
          return;
        }

        if (profileData.role !== "counselor") {
          setActionMessage("You are not authorized as a counselor.");
          setIsPageLoading(false);
          return;
        }

        setCounselorProfile(profileData);
        // Ambil counselors.id berdasarkan email login
        const { data: cData } = await supabase
          .from("counselors")
          .select("id, name, email")
          .or(`email.eq.${user.email},auth_email.eq.${user.email}`)
          .maybeSingle();

        if (cData) setCounselorData(cData);
      } catch (error) {
        console.error("Error in checkUser:", error);
        setActionMessage(`Error: ${error.message}`);
      } finally {
        setIsPageLoading(false);
      }
    };
    checkUser();
  }, []);

  // Fetch schedules + booked consultations dari Supabase
  const fetchSchedules = async () => {
    if (!counselorProfile) return;
    setIsLoading(true);
    try {
      const cid = counselorData?.id || null;
      console.log("fetchSchedules: counselorData id =", cid, "email =", counselorProfile.email);

      let query = supabase
        .from("counselor_schedules")
        .select("*")
        .order("schedule_date", { ascending: true })
        .order("start_time", { ascending: true });

      // Cari by counselor_id kalo ada, fallback ke email buat legacy data
      if (cid) {
        query = query.eq("counselor_id", cid);
      } else {
        query = query.eq("counselor_email", counselorProfile.email);
      }

      const { data, error } = await query;

      console.log("fetchSchedules: result", data, error);

      if (error) {
        setActionMessage(`Error: ${error.message}`);
        return;
      }
      setSchedules(data || []);

      // Gunakan counselorData yang sudah ada (dari checkUser)
      if (counselorData) {
        const { data: consultations } = await supabase
          .from("consultations")
          .select("consultation_date, consultation_hour")
          .eq("counselor_id", counselorData.id)
          .neq("status", "cancelled");

        const map = {};
        consultations?.forEach((c) => {
          const hour = c.consultation_hour?.replace(":", ".");
          if (hour) {
            if (!map[c.consultation_date]) map[c.consultation_date] = [];
            if (!map[c.consultation_date].includes(hour)) map[c.consultation_date].push(hour);
          }
        });
        setBookedSlotsMap(map);
      } else {
        console.warn("Counselor not found in counselors table — booking page won't see schedules");
      }
    } catch (error) {
      setActionMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (counselorProfile) {
      fetchSchedules();
    }
  }, [counselorProfile, counselorData]);

  // Auto dismiss action message
  useEffect(() => {
    if (!actionMessage) return;
    const timer = setTimeout(() => setActionMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [actionMessage]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ADD SCHEDULE ke Supabase
  const handleAddSchedule = async (e) => {
    e.preventDefault();
    if (!form.scheduleDate || !form.startTime || !form.endTime) {
      setActionMessage("Please complete all schedule fields.");
      return;
    }
    if (!counselorProfile) {
      setActionMessage("Please login as counselor first.");
      return;
    }
    if (form.startTime >= form.endTime) {
      setActionMessage("Start time must be before end time.");
      return;
    }

    // Cek apakah sudah ada jadwal pada tanggal, waktu, dan mode yang sama
    const existing = schedules.find(
      (s) =>
        s.schedule_date === form.scheduleDate &&
        s.mode === form.mode &&
        ((form.startTime >= s.start_time && form.startTime < s.end_time) ||
          (form.endTime > s.start_time && form.endTime <= s.end_time) ||
          (form.startTime <= s.start_time && form.endTime >= s.end_time))
    );
    if (existing) {
      setActionMessage("Schedule already exists for this time range on the same date and mode.");
      return;
    }

    setIsLoading(true);
    setActionMessage("Saving schedule...");
    try {
      if (!counselorData) {
        setActionMessage("Data konselor tidak ditemukan. Hubungi admin.");
        setIsLoading(false);
        return;
      }
      const scheduleData = {
        counselor_id: counselorData.id,
        counselor_email: counselorProfile.email,
        counselor_name: counselorProfile.full_name || counselorProfile.name,
        schedule_date: form.scheduleDate,
        start_time: form.startTime,
        end_time: form.endTime,
        mode: form.mode,
        status: "available",
      };

      const { error: insertError } = await supabase
        .from("counselor_schedules")
        .insert([scheduleData]);

      if (insertError) {
        if (insertError.code === "23505") {
          setActionMessage("Duplicate schedule entry.");
        } else {
          setActionMessage(`Error: ${insertError.message}`);
          console.error("Insert error:", insertError);
        }
        return;
      }

      await logActivity({
        actor_id: counselorProfile.id,
        actor_name: counselorProfile.full_name || counselorProfile.name,
        actor_role: "Counselor",
        action: "Added consultation schedule",
        category: "Counselors",
        status: "Completed",
        description: `${form.scheduleDate} ${form.startTime}-${form.endTime} (${form.mode})`,
      });

      setForm({
        scheduleDate: "",
        startTime: "",
        endTime: "",
        mode: "online",
      });
      setActionMessage("✅ Schedule added! Memuat ulang...");
      await fetchSchedules();
      setActionMessage("✅ Schedule added successfully!");
    } catch (error) {
      console.error(error);
      setActionMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // DELETE SCHEDULE dari Supabase
  const handleDeleteSchedule = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this schedule?");
    if (!confirmed) return;

    setIsLoading(true);
    setActionMessage("Deleting schedule...");
    try {
      const { error } = await supabase
        .from("counselor_schedules")
        .delete()
        .eq("id", id);

      if (error) {
        setActionMessage(`Error: ${error.message}`);
        return;
      }

      await fetchSchedules();

      await logActivity({
        actor_id: counselorProfile.id,
        actor_name: counselorProfile.full_name || counselorProfile.name,
        actor_role: "Counselor",
        action: "Deleted consultation schedule",
        category: "Counselors",
        status: "Completed",
        description: `Schedule ID ${id} removed`,
      });

      setActionMessage("✅ Schedule deleted successfully!");
    } catch (error) {
      setActionMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMode = (mode) => {
    return mode === "online" ? "Online (Chat)" : "Offline (Tatap Muka)";
  };

  if (isPageLoading) {
    return (
      <main className="min-h-screen bg-[#d9edf8] px-8 py-10">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#db2d8d] border-t-transparent mx-auto"></div>
            <p className="text-[#e1268d]">Loading profile...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!isLoggedIn || !counselorProfile) {
    return (
      <main className="min-h-screen bg-[#d9edf8] px-8 py-10">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto bg-white rounded-2xl p-8 shadow-lg">
            <div className="mb-4 flex justify-center text-[#db2d8d]">
              <Icon icon="solar:lock-keyhole-bold" className="text-[58px]" />
            </div>
            <h2 className="text-2xl font-bold text-[#e1268d] mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              {actionMessage || "Please login as a counselor to access this page."}
            </p>
            <button
              onClick={() => window.location.href = "/login"}
              className="rounded-full bg-[#db2d8d] px-6 py-2 font-semibold text-white transition hover:bg-[#c8277e]"
            >
              Go to Login
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#d9edf8] px-4 py-8 sm:px-8 sm:py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#e1268d] sm:text-4xl">Counselor Schedule</h1>
        <p className="mt-2 text-[#f08bbf]">Set your available consultation schedule</p>
        {counselorProfile && (
          <p className="mt-1 text-sm text-[#0c72a6]">
            Welcome, {counselorProfile.full_name || counselorProfile.name}
          </p>
        )}
      </div>

      {actionMessage && (
        <div className="mb-4 rounded-full bg-white/90 px-4 py-2 text-[13px] font-medium text-[#db2d8d] shadow-sm w-fit">
          {actionMessage}
        </div>
      )}

      {/* Form Add Schedule */}
      <form onSubmit={handleAddSchedule} className="rounded-2xl bg-white p-6 shadow-lg">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#666]">Date</label>
            <input
              type="date"
              name="scheduleDate"
              value={form.scheduleDate}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#e6e6e6] bg-pink-50 p-3 outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#666]">Start Time</label>
            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#e6e6e6] bg-pink-50 p-3 outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#666]">End Time</label>
            <input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#e6e6e6] bg-pink-50 p-3 outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#666]">Mode</label>
            <select
              name="mode"
              value={form.mode}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#e6e6e6] bg-pink-50 p-3 outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
            >
              <option value="online">Online (Chat)</option>
              <option value="offline">Offline (Tatap Muka)</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#db2d8d] px-6 py-3 font-semibold text-white transition hover:bg-[#c8277e] disabled:opacity-50"
        >
          {isLoading ? (
            "Saving..."
          ) : (
            <>
              <Icon icon="solar:add-circle-bold" className="text-[18px]" />
              Add Schedule
            </>
          )}
        </button>
      </form>

      {/* Schedules List */}
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-xl font-bold text-[#0c72a6]">
            Your Schedules ({schedules.length})
          </h2>

          {/* Filter tabs */}
          <div className="flex gap-2">
            {["all", "available", "booked"].map((tab) => (
              <button key={tab} onClick={() => setFilterTab(tab)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${filterTab === tab
                  ? "bg-[#db2d8d] text-white"
                  : "border border-[#f3c5dc] bg-white text-[#666] hover:bg-[#fff5fa]"
                  }`}>
                <span className="flex items-center gap-1.5">
                  {tab === "available" && (
                    <Icon icon="solar:check-circle-bold" className="text-[14px]" />
                  )}
                  {tab === "booked" && (
                    <Icon icon="solar:close-circle-bold" className="text-[14px]" />
                  )}
                  {tab === "all" ? "All" : tab === "available" ? "Available" : "Booked"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {isLoading && schedules.length === 0 && (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#db2d8d] border-t-transparent"></div>
          </div>
        )}

        {!isLoading && schedules.length === 0 && (
          <div className="rounded-2xl bg-white p-8 text-center shadow">
            <p className="text-gray-500">No schedule added yet.</p>
            <p className="mt-2 text-sm text-gray-400">
              Add your first schedule using the form above.
            </p>
          </div>
        )}

        {schedules.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {schedules
              .filter((item) => {
                if (filterTab === "all") return true;
                const slots = splitIntoHourlySlots(item.start_time, item.end_time);
                const booked = bookedSlotsMap[item.schedule_date] || [];
                const hasBooked = slots.some((s) => booked.includes(s));
                const hasAvailable = slots.some((s) => !booked.includes(s));
                if (filterTab === "booked") return hasBooked;
                if (filterTab === "available") return hasAvailable;
                return true;
              })
              .map((item) => {
                const slots = splitIntoHourlySlots(item.start_time, item.end_time);
                const booked = bookedSlotsMap[item.schedule_date] || [];
                const totalBooked = slots.filter((s) => booked.includes(s)).length;

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-white p-5 shadow-lg transition hover:shadow-xl"
                  >
                    <div className="flex items-start justify-between">
                      <h2 className="text-lg font-bold text-[#0C72A6]">
                        {formatDate(item.schedule_date)}
                      </h2>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${item.mode === "online"
                          ? "bg-[#dff4ff] text-[#0c72a6]"
                          : "bg-[#fde8f3] text-[#db2d8d]"
                          }`}
                      >
                        <Icon
                          icon={item.mode === "online" ? "solar:chat-round-dots-bold" : "solar:hospital-bold"}
                          className="text-[14px]"
                        />
                        {formatMode(item.mode)}
                      </span>
                    </div>
                    <p className="mt-3 flex items-center gap-2 text-gray-700">
                      <Icon icon="solar:clock-circle-bold" className="text-[17px] text-[#0c72a6]" />
                      {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}
                    </p>

                    {/* Per-slot status */}
                    <div className="mt-3 space-y-1">
                      {slots.map((slot) => {
                        const isBooked = booked.includes(slot);
                        return (
                          <div key={slot} className="flex items-center gap-2 text-sm">
                            <span className="w-12 font-mono text-gray-600">{slot}</span>
                            {isBooked ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#e5486d]">
                                <Icon icon="solar:close-circle-bold" className="text-[14px]" />
                                Booked
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1f9d62]">
                                <Icon icon="solar:check-circle-bold" className="text-[14px]" />
                                Available
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-3 text-xs text-gray-400">
                      {totalBooked} of {slots.length} slot{slots.length > 1 ? "s" : ""} booked
                    </div>

                    <button
                      onClick={() => handleDeleteSchedule(item.id)}
                      disabled={isLoading}
                      className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#fff5fa] px-4 py-2 text-sm font-semibold text-[#db2d8d] transition hover:bg-[#ffe7f1] disabled:opacity-50"
                    >
                      <Icon icon="solar:trash-bin-trash-bold" className="text-[16px]" />
                      Delete Schedule
                    </button>
                  </div>
                );
              })}
          </div>
        )}
      </section>
    </main>
  );
}