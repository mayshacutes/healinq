"use client";

import { useEffect, useState } from "react";

export default function TicketBooking() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 1,
    minutes: 42,
    seconds: 17,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const totalSeconds =
          prev.hours * 3600 + prev.minutes * 60 + prev.seconds - 1;

        if (totalSeconds <= 0) {
          clearInterval(timer);
          return { hours: 0, minutes: 0, seconds: 0 };
        }

        return {
          hours: Math.floor(totalSeconds / 3600),
          minutes: Math.floor((totalSeconds % 3600) / 60),
          seconds: totalSeconds % 60,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (val) => String(val).padStart(2, "0");

  return (
    <div className="bg-[#d4eefc] min-h-screen flex flex-col items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-lg text-center w-[500px]">
        <h1 className="text-2xl font-bold mb-4">
          Booking Confirmed!
        </h1>

        <p className="mb-6 text-gray-600">
          Your session will start at:
        </p>

        <div className="text-4xl font-bold text-pink-600 mb-6">
          {formatTime(timeLeft.hours)}:
          {formatTime(timeLeft.minutes)}:
          {formatTime(timeLeft.seconds)}
        </div>

        <div className="text-left space-y-3">
          <p><b>Doctor:</b> Dr. Diandra Aliyya</p>
          <p><b>Date:</b> 5 Maret 2026</p>
          <p><b>Time:</b> 10:00 - 11:00 WIB</p>
          <p><b>Location:</b> Surabaya</p>
          <p><b>Booking Code:</b> 123.456.789</p>
        </div>

        <button className="mt-6 w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600">
          Confirm
        </button>
      </div>
    </div>
  );
}