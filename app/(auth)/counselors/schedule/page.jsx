"use client";

import { useEffect, useState } from "react";
import { getStorage, setStorage } from "@/lib/storage";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function CounselorSchedulePage() {
  const [schedules, setSchedules] = useState([]);

  const [form, setForm] = useState({
    day: "Monday",
    startTime: "",
    endTime: "",
    mode: "online",
  });

  useEffect(() => {
    const savedSchedules = getStorage("healinq_counselor_schedules", []);
    setSchedules(savedSchedules);
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddSchedule = (e) => {
    e.preventDefault();

    if (!form.startTime || !form.endTime) {
      alert("Please complete the schedule first.");
      return;
    }

    const newSchedule = {
      id: Date.now(),
      counselorEmail: "aulia@healinq.com",
      ...form,
    };

    const updatedSchedules = [newSchedule, ...schedules];

    setSchedules(updatedSchedules);
    setStorage("healinq_counselor_schedules", updatedSchedules);

    setForm({
      day: "Monday",
      startTime: "",
      endTime: "",
      mode: "online",
    });
  };

  const handleDeleteSchedule = (id) => {
    const updatedSchedules = schedules.filter((item) => item.id !== id);

    setSchedules(updatedSchedules);
    setStorage("healinq_counselor_schedules", updatedSchedules);
  };

  return (
    <main className="min-h-screen bg-[#d9edf8] px-8 py-10">
      <h1 className="text-4xl font-bold text-[#e1268d]">
        Counselor Schedule
      </h1>

      <p className="mt-2 text-[#f08bbf]">
        Set your available consultation schedule
      </p>

      <form
        onSubmit={handleAddSchedule}
        className="mt-8 rounded-2xl bg-white p-6 shadow"
      >
        <div className="grid gap-4 md:grid-cols-4">
          <select
            name="day"
            value={form.day}
            onChange={handleChange}
            className="rounded-lg bg-pink-50 p-3 outline-none"
          >
            {days.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>

          <input
            type="time"
            name="startTime"
            value={form.startTime}
            onChange={handleChange}
            className="rounded-lg bg-pink-50 p-3 outline-none"
          />

          <input
            type="time"
            name="endTime"
            value={form.endTime}
            onChange={handleChange}
            className="rounded-lg bg-pink-50 p-3 outline-none"
          />

          <select
            name="mode"
            value={form.mode}
            onChange={handleChange}
            className="rounded-lg bg-pink-50 p-3 outline-none"
          >
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </div>

        <button
          type="submit"
          className="mt-5 rounded-full bg-[#0C72A6] px-6 py-3 font-semibold text-white hover:bg-[#095f8c]"
        >
          Add Schedule
        </button>
      </form>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {schedules.length === 0 ? (
          <p className="text-gray-500">No schedule added yet.</p>
        ) : (
          schedules.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-white p-5 shadow"
            >
              <h2 className="font-bold text-[#0C72A6]">
                {item.day}
              </h2>

              <p className="mt-2">
                {item.startTime} - {item.endTime}
              </p>

              <p className="mt-1 capitalize text-pink-500">
                {item.mode}
              </p>

              <button
                onClick={() => handleDeleteSchedule(item.id)}
                className="mt-4 rounded-full bg-pink-100 px-4 py-2 text-sm font-semibold text-pink-600"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </section>
    </main>
  );
}