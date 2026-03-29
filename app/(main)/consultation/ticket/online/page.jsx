"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TicketBooking() {
  const router = useRouter();

  const [timeLeft, setTimeLeft] = useState({
    hours: 1,
    minutes: 42,
    seconds: 17,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const total =
          prev.hours * 3600 + prev.minutes * 60 + prev.seconds - 1;

        if (total <= 0) return { hours: 0, minutes: 0, seconds: 0 };

        return {
          hours: Math.floor(total / 3600),
          minutes: Math.floor((total % 3600) / 60),
          seconds: total % 60,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const format = (v) => String(v).padStart(2, "0");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#cdeefd] to-[#a8d8f0] p-10">

      {/* HEADER */}
      <h1 className="text-3xl font-bold text-center text-white mb-10">
        Booking Confirmed!
      </h1>

      {/* CARD */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow p-8">

        {/* PROFILE */}
        <div className="flex items-center gap-5 mb-6">
          <div className="w-20 h-20 bg-gray-300 rounded-full" />

          <div>
            <h2 className="font-bold text-lg">
              Dr. Diandra Aliyya Khoirunnisa, M.Psi
            </h2>
            <p className="text-sm text-gray-500">
              Psikolog Klinis | Online
            </p>

            <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs">
              ✔ Verified
            </span>
          </div>
        </div>

        {/* INFO GRID */}
        <div className="grid grid-cols-3 gap-4 mb-6">

          <div className="bg-pink-100 p-4 rounded-xl">
            <p className="text-sm">📅 Tanggal</p>
            <p className="font-semibold text-pink-600">
              Kamis, 5 Maret 2026
            </p>
          </div>

          <div className="bg-pink-100 p-4 rounded-xl">
            <p className="text-sm">⏰ Time Session</p>
            <p className="font-semibold text-pink-600">
              10.00 - 11.00 WIB
            </p>
          </div>

          <div className="bg-pink-100 p-4 rounded-xl">
            <p className="text-sm">🔖 Booking Code</p>
            <p className="font-semibold text-pink-600">
              123.456.789
            </p>
          </div>

        </div>

        {/* PREVIEW */}
        <div className="bg-pink-100 p-4 rounded-xl mb-6">
          <p className="font-medium mb-2">💬 Consultation Preview</p>
          <div className="bg-white p-3 rounded">
            Saya ingin konsultasi mengenai overthinking dan anxiety...
          </div>
        </div>

        {/* COUNTDOWN */}
        <p className="text-center text-xl font-semibold mb-3">
          Your session will be started at:
        </p>

        <div className="text-center text-4xl font-bold text-pink-600 mb-8">
          {format(timeLeft.hours)}:{format(timeLeft.minutes)}:
          {format(timeLeft.seconds)}
        </div>

        {/* BUTTON */}
        <div className="flex justify-center">
          <button
            onClick={() => router.push("/consultation/chat")}
            className="bg-pink-200 border-2 border-pink-400 px-8 py-3 rounded-full text-pink-700 font-bold hover:bg-pink-300 transition"
          >
            Go to Room Chat
          </button>
        </div>

      </div>
    </div>
  );
}