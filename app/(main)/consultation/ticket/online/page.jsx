"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Barcode from "react-barcode";
import BackIconButton from "@/components/BackIconButton";

function normalizeHour(hour) {
  return hour?.replace(".", ":") || "00:00";
}

function getSessionStatus(date, hour, duration = 60) {
  const formattedHour = normalizeHour(hour);
  const start = new Date(`${date}T${formattedHour}:00`);
  const end = new Date(start.getTime() + duration * 60 * 1000);
  const now = new Date();

  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "ongoing";
  return "finished";
}

export default function TicketOnlinePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const bookingCodeFromUrl = searchParams.get("bookingCode");

  const [ticketData, setTicketData] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const savedBookings = JSON.parse(localStorage.getItem("myBookings")) || [];
    const savedLatestTicket = localStorage.getItem("latestTicket");

    if (bookingCodeFromUrl) {
      const selectedBooking = savedBookings.find(
        (booking) => booking.bookingCode === bookingCodeFromUrl
      );

      if (selectedBooking) {
        setTicketData(selectedBooking);
        localStorage.setItem("latestTicket", JSON.stringify(selectedBooking));
        return;
      }
    }

    if (savedLatestTicket) {
      setTicketData(JSON.parse(savedLatestTicket));
    }
  }, [bookingCodeFromUrl]);

  const name =
    ticketData?.counselorName ||
    searchParams.get("name") ||
    "Dr. Diandra Aliyya Khoirunnisa";

  const date =
    ticketData?.date ||
    searchParams.get("date") ||
    "2026-03-05";

  const hour =
    ticketData?.hour ||
    searchParams.get("hour") ||
    "10.00";

  const bookingCode =
    ticketData?.bookingCode ||
    bookingCodeFromUrl ||
    "123.456.789.123";

  const topic = ticketData?.topic || "";
  const duration = ticketData?.sessionDuration || 60;

  const formattedHour = normalizeHour(hour);

  useEffect(() => {
    const interval = setInterval(() => {
      const target = new Date(`${date}T${formattedHour}:00`);
      const now = new Date();
      const diff = target - now;

      if (diff <= 0) {
        const sessionStatus = getSessionStatus(date, hour, duration);

        if (sessionStatus === "ongoing") {
          setTimeLeft("Session Ongoing");
        } else {
          setTimeLeft("Session Ended");
        }

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
  }, [date, hour, formattedHour, duration]);

  const sessionStatus = getSessionStatus(date, hour, duration);
  const canEnterChat = sessionStatus === "ongoing";

  return (
    <div className="min-h-screen bg-[#d4eefb] flex flex-col items-center justify-center py-10">
      <div className="absolute top-6 left-6">
      <BackIconButton to="/consultation" />
      </div>
      {/* ================= TICKET ================= */}
      <div className="relative w-[900px]">
        <Image
          src="/images/ticket.png"
          alt="ticket"
          width={900}
          height={420}
        />

        <div className="absolute inset-0 flex px-10 py-8">
          {/* LEFT */}
          <div className="w-[68%] pr-6">
            <div className="bg-pink-500 text-white text-center py-2 rounded-t-xl font-semibold">
              Booking Confirmed!
            </div>

            <div className="bg-[#f3f3f3] p-4 rounded-b-xl space-y-4">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-gray-300 rounded-full" />

                <div className="flex-1">
                  <p className="font-bold">{name}</p>
                  <p className="text-sm text-gray-600">
                    Psikolog Klinis | Online
                  </p>

                  <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                    ✔ Paid & Verified
                  </span>
                </div>

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

              <div className="bg-pink-100 px-3 py-2 rounded-lg text-xs">
                <p className="font-semibold">Booking Code</p>
                <p className="text-pink-600 font-semibold">
                  {bookingCode}
                </p>
              </div>

              <div>
                <p className="text-sm mb-1">
                  ☐ Consultation Preview
                </p>

                <div className="h-16 bg-gray-200 rounded-lg p-2 text-xs text-gray-600 overflow-hidden">
                  {topic || "No topic written."}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="w-[32%] flex items-center justify-center border-l-2 border-dashed border-pink-300">
            <div className="rotate-90">
              <Barcode
                value={bookingCode}
                height={80}
                width={1.5}
                displayValue={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= COUNTDOWN + BUTTONS ================= */}
      <div className="mt-12 text-center">
        <p className="text-xl font-medium">
          Your session will be started at:
        </p>

        <h1 className="text-4xl font-bold text-pink-500 mt-2">
          {timeLeft}
        </h1>

        <button
          onClick={() => {
            if (!canEnterChat) return;
            router.push(`/consultation/chat?bookingCode=${bookingCode}`);
          }}
          disabled={!canEnterChat}
          className={`mt-5 px-6 py-2 rounded-full font-semibold ${
            canEnterChat
              ? "bg-pink-300 text-pink-700 hover:opacity-90"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {sessionStatus === "upcoming"
            ? "Room Chat Not Started Yet"
            : sessionStatus === "finished"
            ? "Session Ended"
            : "Go to Room Chat"}
        </button>

        <button
          onClick={() => router.push("/consultation/my-bookings")}
          className="block mx-auto mt-3 px-6 py-2 bg-white text-[#0C72A6] rounded-full font-semibold hover:opacity-90"
        >
          My Bookings
        </button>
      </div>
    </div>
  );
}