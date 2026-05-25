"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function CounselorSchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");
  const [counselorProfile, setCounselorProfile] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [form, setForm] = useState({
    day: "Monday",
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
        
        console.log("User check:", { user, userError });
        
        if (userError || !user) {
          console.error("User not logged in", userError);
          setActionMessage("Please login first to access this page.");
          setIsPageLoading(false);
          return;
        }

        setIsLoggedIn(true);
        
        // Cari profile berdasarkan user id
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        console.log("Profile data:", { profileData, profileError });

        if (profileError) {
          console.error("Error fetching profile:", profileError);
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
        
      } catch (error) {
        console.error("Error in checkUser:", error);
        setActionMessage(`Error: ${error.message}`);
      } finally {
        setIsPageLoading(false);
      }
    };

    checkUser();
  }, []);

  // Fetch schedules dari Supabase
  const fetchSchedules = async () => {
    if (!counselorProfile) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("counselor_schedules")
        .select("*")
        .eq("counselor_id", counselorProfile.id)
        .order("day", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Fetch error:", error);
        setActionMessage(`Error: ${error.message}`);
        return;
      }

      console.log("Schedules fetched:", data?.length || 0);
      setSchedules(data || []);
    } catch (error) {
      console.error("Unexpected error:", error);
      setActionMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (counselorProfile) {
      fetchSchedules();
    }
  }, [counselorProfile]);

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

    if (!form.startTime || !form.endTime) {
      setActionMessage("Please complete the schedule first.");
      return;
    }

    if (!counselorProfile) {
      setActionMessage("Please login as counselor first.");
      return;
    }

    // Validasi waktu
    if (form.startTime >= form.endTime) {
      setActionMessage("Start time must be before end time.");
      return;
    }

    // Cek apakah sudah ada jadwal di hari yang sama dengan waktu yang bentrok
    const existingSchedule = schedules.find(
      (s) => s.day === form.day && 
      ((form.startTime >= s.start_time && form.startTime < s.end_time) ||
       (form.endTime > s.start_time && form.endTime <= s.end_time) ||
       (form.startTime <= s.start_time && form.endTime >= s.end_time))
    );

    if (existingSchedule) {
      setActionMessage("Schedule already exists for this time range on the same day.");
      return;
    }

    setIsLoading(true);
    setActionMessage("Saving schedule...");

    try {
      const scheduleData = {
        counselor_id: counselorProfile.id,
        counselor_email: counselorProfile.email,
        counselor_name: counselorProfile.full_name || counselorProfile.name,
        day: form.day,
        start_time: form.startTime,
        end_time: form.endTime,
        mode: form.mode,
        status: "available",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log("Inserting schedule:", scheduleData);

      const { data, error } = await supabase
        .from("counselor_schedules")
        .insert([scheduleData])
        .select();

      if (error) {
        console.error("Insert error:", error);
        if (error.code === "23505") {
          setActionMessage("Schedule already exists for this time slot.");
        } else {
          setActionMessage(`Error: ${error.message}`);
        }
        return;
      }

      console.log("Schedule added:", data);
      await fetchSchedules();

      setForm({
        day: "Monday",
        startTime: "",
        endTime: "",
        mode: "online",
      });
      setActionMessage("✅ Schedule added successfully!");
      
    } catch (error) {
      console.error("Unexpected error:", error);
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
        console.error("Delete error:", error);
        setActionMessage(`Error: ${error.message}`);
        return;
      }

      await fetchSchedules();
      setActionMessage("✅ Schedule deleted successfully!");
      
    } catch (error) {
      console.error("Unexpected error:", error);
      setActionMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Format day ke Bahasa Indonesia
  const formatDay = (day) => {
    const dayMap = {
      "Monday": "Senin",
      "Tuesday": "Selasa",
      "Wednesday": "Rabu",
      "Thursday": "Kamis",
      "Friday": "Jumat",
      "Saturday": "Sabtu",
      "Sunday": "Minggu",
    };
    return dayMap[day] || day;
  };

  // Format mode
  const formatMode = (mode) => {
    return mode === "online" ? "Online (Video Call)" : "Offline (Tatap Muka)";
  };

  // Loading page
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

  // Jika belum login atau bukan counselor
  if (!isLoggedIn || !counselorProfile) {
    return (
      <main className="min-h-screen bg-[#d9edf8] px-8 py-10">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-[#e1268d] mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              {actionMessage || "Please login as a counselor to access this page."}
            </p>
            <button
              onClick={() => window.location.href = "/login"}
              className="rounded-full bg-[#0C72A6] px-6 py-2 text-white hover:bg-[#095f8c]"
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
        <h1 className="text-3xl font-bold text-[#e1268d] sm:text-4xl">
          Counselor Schedule
        </h1>
        <p className="mt-2 text-[#f08bbf]">
          Set your available consultation schedule
        </p>
        {counselorProfile && (
          <p className="mt-1 text-sm text-[#0c72a6]">
            Welcome, {counselorProfile.full_name || counselorProfile.name || counselorProfile.username}
          </p>
        )}
      </div>

      {/* Action Message */}
      {actionMessage && (
        <div className="mb-4 rounded-full bg-white/90 px-4 py-2 text-[13px] font-medium text-[#db2d8d] shadow-sm w-fit">
          {actionMessage}
        </div>
      )}

      {/* Form Add Schedule */}
      <form
        onSubmit={handleAddSchedule}
        className="rounded-2xl bg-white p-6 shadow-lg"
      >
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#666]">
              Day
            </label>
            <select
              name="day"
              value={form.day}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#e6e6e6] bg-pink-50 p-3 outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
            >
              {days.map((day) => (
                <option key={day} value={day}>
                  {formatDay(day)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#666]">
              Start Time
            </label>
            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#e6e6e6] bg-pink-50 p-3 outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#666]">
              End Time
            </label>
            <input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#e6e6e6] bg-pink-50 p-3 outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#666]">
              Consultation Mode
            </label>
            <select
              name="mode"
              value={form.mode}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#e6e6e6] bg-pink-50 p-3 outline-none focus:ring-2 focus:ring-[#e85fa7]/20"
            >
              <option value="online">Online (Video Call)</option>
              <option value="offline">Offline (Tatap Muka)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 rounded-full bg-[#0C72A6] px-6 py-3 font-semibold text-white transition hover:bg-[#095f8c] disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "+ Add Schedule"}
        </button>
      </form>

      {/* Schedules List */}
      <section className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-[#0c72a6]">
          Your Schedules ({schedules.length})
        </h2>
        
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
            {schedules.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-white p-5 shadow-lg transition hover:shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-bold text-[#0C72A6]">
                    {formatDay(item.day)}
                  </h2>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                    item.mode === "online" 
                      ? "bg-blue-100 text-blue-700" 
                      : "bg-purple-100 text-purple-700"
                  }`}>
                    {formatMode(item.mode)}
                  </span>
                </div>

                <p className="mt-3 text-gray-700">
                  🕐 {item.start_time} - {item.end_time}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Status: <span className="font-medium text-green-600">{item.status || "Available"}</span>
                </p>

                <button
                  onClick={() => handleDeleteSchedule(item.id)}
                  disabled={isLoading}
                  className="mt-4 rounded-full bg-pink-100 px-4 py-2 text-sm font-semibold text-pink-600 transition hover:bg-pink-200 disabled:opacity-50"
                >
                  Delete Schedule
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}