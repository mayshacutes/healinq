"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Barcode from "react-barcode";

export default function TicketPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { type } = useParams();

  const name =
    searchParams.get("name") || "Dr. Diandra Aliyya Khoirunnisa";
  const date = searchParams.get("date") || "2026-03-05";
  const hour = searchParams.get("hour") || "10:00";

  const [timeLeft, setTimeLeft] = useState("");

  // 🔥 FORMAT JAM (biar 10.00 → 10:00)
  const formattedHour = hour.replace(".", ":");

  // 🔥 COUNTDOWN
  useEffect(() => {
    const interval = setInterval(() => {
      const target = new Date(`${date}T${formattedHour}:00`);
      const now = new Date();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft("Session Started");
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft(
        `${String(h).padStart(2, "0")}:${String(m).padStart(
          2,
          "0"
        )}:${String(s).padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [date, formattedHour]);

  return (
    <div className="min-h-screen bg-[#d4eefb] flex flex-col items-center justify-center">

      {/* ================= TICKET ================= */}
      <div className="relative w-[900px]">

        {/* BACKGROUND */}
        <Image
          src="/images/ticket.png"
          alt="ticket"
          width={900}
          height={420}
        />

        {/* CONTENT */}
        <div className="absolute inset-0 flex px-10 py-8">

          {/* ================= LEFT ================= */}
          <div className="w-[68%] pr-6">

            {/* HEADER */}
            <div className="bg-pink-500 text-white text-center py-2 rounded-t-xl font-semibold">
              Booking Confirmed!
            </div>

            {/* MAIN CARD */}
            <div className="bg-[#f3f3f3] p-4 rounded-b-xl space-y-4">

              <div className="flex gap-4">

                {/* PROFILE */}
                <div className="w-16 h-16 bg-gray-300 rounded-full" />

                {/* INFO */}
                <div className="flex-1">
                  <p className="font-bold">{name}</p>
                  <p className="text-sm text-gray-600">
                    Psikolog Klinis | {type}
                  </p>

                  <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                    ✔ Verified
                  </span>
                </div>

                {/* DATE + TIME BOX */}
                <div className="flex gap-2">

                  <div className="bg-pink-100 px-3 py-2 rounded-lg text-xs">
                    <p className="font-semibold">Tanggal</p>
                    <p>{date}</p>
                  </div>

                  <div className="bg-pink-100 px-3 py-2 rounded-lg text-xs">
                    <p className="font-semibold">Time Session</p>
                    <p>{hour} WIB</p>
                  </div>

                </div>
              </div>

              {/* BOOKING CODE */}
              <div className="bg-pink-100 px-3 py-2 rounded-lg text-xs">
                <p className="font-semibold">Booking Code</p>
                <p className="text-pink-600 font-semibold">
                  123.456.789.123
                </p>
              </div>

              {/* PREVIEW */}
              <div>
                <p className="text-sm mb-1">
                  ☐ Consultation Preview
                </p>
                <div className="h-16 bg-gray-200 rounded-lg" />
              </div>

            </div>
          </div>

          {/* ================= RIGHT (BARCODE) ================= */}
          <div className="w-[32%] flex items-center justify-center border-l-2 border-dashed border-pink-300">

            <div className="rotate-90">
              <Barcode
                value="123456789"
                height={80}
                width={1.5}
                displayValue={false}
              />
            </div>

          </div>
        </div>
      </div>

      {/* ================= COUNTDOWN ================= */}
      <div className="mt-12 text-center">
        <p className="text-xl font-medium">
          Your session will be started at:
        </p>

        <h1 className="text-4xl font-bold text-pink-500 mt-2">
          {timeLeft}
        </h1>

        <button
          onClick={() => router.push("/consultation/chat")}
          className="mt-5 px-6 py-2 bg-pink-300 text-pink-700 rounded-full font-semibold hover:opacity-90"
        >
          Go to Room Chat
        </button>
      </div>

    </div>
  );
}