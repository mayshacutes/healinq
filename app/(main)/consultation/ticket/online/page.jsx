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

function formatRupiah(number) {
  if (typeof number !== "number") return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
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

  useEffect(() => {
    if (!ticketData) return;

    const interval = setInterval(() => {
      const target = new Date(`${ticketData.date}T${normalizeHour(ticketData.hour)}:00`);
      const now = new Date();
      const diff = target - now;

      if (diff <= 0) {
        const status = getSessionStatus(ticketData.date, ticketData.hour, ticketData.sessionDuration || 60);
        if (status === "ongoing") setTimeLeft("🔴 Session Ongoing");
        else setTimeLeft("⏰ Session Ended");
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [ticketData]);

  if (!ticketData) {
    return (
      <div className="min-h-screen bg-[#d4eefb] flex items-center justify-center p-10">
        <div className="bg-white rounded-2xl p-8 shadow text-center w-full max-w-lg">
          <h1 className="text-2xl font-bold text-[#0C72A6]">Ticket Not Found</h1>
          <p className="mt-3 text-gray-600">
            Data tiket tidak ditemukan. Pastikan booking sudah tersimpan dan coba lagi dari halaman My Bookings.
          </p>
          <button
            onClick={() => router.push("/consultation/my-bookings")}
            className="mt-4 bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition"
          >
            Go to My Bookings
          </button>
        </div>
      </div>
    );
  }

  const name = ticketData.counselorName || searchParams.get("name") || "Dr. Diandra Aliyya Khoirunnisa";
  const date = ticketData.date || searchParams.get("date") || "2026-03-05";
  const hour = ticketData.hour || searchParams.get("hour") || "10.00";
  const bookingCode = ticketData.bookingCode || bookingCodeFromUrl || "123.456.789.123";
  const topic = ticketData.topic || "";
  const duration = ticketData.sessionDuration || 60;

  const isPaymentVerified =
    ticketData.paymentStatus === "Paid" ||
    (ticketData.paymentStatus === "Pending Verification" && ticketData.adminApproved);

  const bookingStatusLabel = ticketData.paymentStatus === "Pending Verification"
    ? "Pending Verification"
    : isPaymentVerified
    ? "Paid & Verified"
    : ticketData.paymentStatus || "Unknown";

  const bookingStatusClass = isPaymentVerified
    ? "bg-green-100 text-green-600"
    : ticketData.paymentStatus === "Pending Verification"
    ? "bg-yellow-100 text-yellow-700"
    : "bg-gray-100 text-gray-700";

  const sessionStatus = getSessionStatus(date, hour, duration);
  const canEnterChat = sessionStatus === "ongoing" && isPaymentVerified;

  return (
    <div className="min-h-screen bg-[#d4eefb] flex flex-col items-center justify-center py-10 px-4">
      {/* Back Button */}
      <div className="absolute top-6 left-6">
        <BackIconButton to="/consultation" />
      </div>

      {/* ================= TICKET ================= */}
      <div className="relative w-full max-w-[900px]">
        <Image 
          src="/images/ticket.png" 
          alt="ticket" 
          width={900} 
          height={500} 
          className="w-full h-auto"
          priority
        />
        <div className="absolute inset-0 flex flex-col md:flex-row px-4 md:px-8 py-5 md:py-7">
          {/* LEFT */}
          <div className="w-full md:w-[68%] md:pr-5">
            {/* Header */}
            <div className="bg-pink-500 text-white text-center py-1.5 rounded-t-xl font-semibold text-xs md:text-sm tracking-wide">
              ✅ Booking Confirmed!
            </div>
            
            <div className="bg-[#f3f3f3] p-3 md:p-4 rounded-b-xl space-y-3">
              {/* Doctor Info */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-pink-100 rounded-full flex items-center justify-center text-2xl md:text-3xl flex-shrink-0">
                  👩‍⚕️
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm md:text-base truncate">{name}</p>
                  <p className="text-xs md:text-sm text-gray-600">Psikolog Klinis | Online</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className={`inline-block px-2.5 py-0.5 text-[10px] md:text-xs rounded-full ${bookingStatusClass}`}>
                      {bookingStatusLabel}
                    </span>
                    <span className="text-xs md:text-sm text-gray-500">{date}</span>
                  </div>
                </div>
                <div className="bg-pink-100 px-3 py-1.5 rounded-lg text-xs text-center min-w-[70px] flex-shrink-0">
                  <p className="font-semibold text-gray-600 text-[10px] md:text-xs">Time Session</p>
                  <p className="text-pink-600 font-bold text-sm md:text-base">{hour} WIB</p>
                </div>
              </div>

              {/* Booking Code */}
              <div className="bg-pink-100 px-3 py-1.5 rounded-lg text-xs">
                <p className="font-semibold text-gray-600">Booking Code</p>
                <p className="text-pink-600 font-bold font-mono text-sm">{bookingCode}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 bg-white p-3 md:p-4 rounded-2xl text-xs text-gray-700">
                <div>
                  <p className="font-semibold text-gray-400 text-[10px] md:text-xs">Session Type</p>
                  <p className="font-medium text-xs md:text-sm">Online Consultation</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-400 text-[10px] md:text-xs">Payment</p>
                  <p className="font-medium text-xs md:text-sm">{ticketData.paymentMethod || "-"}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-400 text-[10px] md:text-xs">Status</p>
                  <p className="font-medium text-xs md:text-sm">{bookingStatusLabel}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-400 text-[10px] md:text-xs">Total</p>
                  <p className="font-medium text-xs md:text-sm">{formatRupiah(ticketData.totalPayment)}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-400 text-[10px] md:text-xs">Proof</p>
                  <p className="font-medium text-xs md:text-sm">{ticketData.proofFileName || "Not uploaded"}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-400 text-[10px] md:text-xs">Admin Verified</p>
                  <p className="font-medium text-xs md:text-sm">{ticketData.adminApproved ? "✅ Yes" : "⏳ No"}</p>
                </div>
              </div>

              {/* Consultation Preview */}
              <div>
                <p className="text-xs md:text-sm font-semibold text-gray-700 mb-1">📋 Consultation Preview</p>
                <div className="h-12 md:h-14 bg-white rounded-lg p-2 text-xs text-gray-600 overflow-hidden border border-gray-200">
                  {topic || "No topic written."}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT - Barcode */}
          <div className="hidden md:flex w-[32%] items-center justify-center border-l-2 border-dashed border-pink-300">
            <div className="rotate-90">
              <Barcode value={bookingCode} height={90} width={1.8} displayValue={false} />
            </div>
          </div>
        </div>
      </div>

      {/* ================= COUNTDOWN + BUTTONS ================= */}
      <div className="mt-8 md:mt-12 text-center w-full max-w-[900px]">
        <p className="text-sm md:text-base font-medium text-gray-600">
          {sessionStatus === "upcoming" ? "⏳ Your session will be started at:" :
           sessionStatus === "ongoing" ? "🔴 Session is ongoing!" :
           "⏰ Session has ended"}
        </p>
        <h1 className={`text-3xl md:text-4xl font-bold mt-2 ${
          sessionStatus === "ongoing" ? "text-green-500" : "text-pink-500"
        }`}>
          {timeLeft}
        </h1>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-5">
          <button
            onClick={() => {
              if (!canEnterChat) return;
              router.push(`/consultation/chat?bookingCode=${bookingCode}`);
            }}
            disabled={!canEnterChat}
            className={`px-6 py-2.5 rounded-full font-semibold transition text-sm md:text-base ${
              canEnterChat
                ? "bg-pink-500 text-white hover:bg-pink-600 shadow-lg"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {!isPaymentVerified
              ? "⏳ Waiting for Payment Verification"
              : sessionStatus === "upcoming"
              ? "🔒 Room Chat Not Started Yet"
              : sessionStatus === "finished"
              ? "⏰ Session Ended"
              : "💬 Go to Room Chat"}
          </button>
          
          <button
            onClick={() => router.push("/consultation/my-bookings")}
            className="px-6 py-2.5 bg-white text-[#0C72A6] rounded-full font-semibold border border-[#0C72A6] hover:bg-blue-50 transition text-sm md:text-base"
          >
            📋 My Bookings
          </button>
        </div>

        {/* Info tambahan */}
        <p className="text-xs text-gray-400 mt-4">
          Booking Code: {bookingCode} • {date} • {hour} WIB
        </p>
      </div>
    </div>
  );
}