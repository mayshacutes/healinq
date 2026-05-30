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
        if (status === "ongoing") setTimeLeft("Session Ongoing");
        else setTimeLeft("Session Ended");
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
    <div className="min-h-screen bg-[#d4eefb] flex flex-col items-center justify-center py-10">
      <div className="absolute top-6 left-6">
        <BackIconButton to="/consultation" />
      </div>

      {/* ================= TICKET ================= */}
      <div className="relative w-[900px]">
        <Image src="/images/ticket.png" alt="ticket" width={900} height={420} />
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
                  <p className="text-sm text-gray-600">Psikolog Klinis | Online</p>
                  <span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${bookingStatusClass}`}>
                    {bookingStatusLabel}
                  </span>
                  <p className="mt-2 text-sm text-gray-600">{date}</p>
                </div>
                <div className="bg-pink-100 px-3 py-2 rounded-lg text-xs">
                  <p className="font-semibold">Time Session</p>
                  <p>{hour} WIB</p>
                </div>
              </div>

              <div className="bg-pink-100 px-3 py-2 rounded-lg text-xs">
                <p className="font-semibold">Booking Code</p>
                <p className="text-pink-600 font-semibold">{bookingCode}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-2xl text-xs text-gray-700">
                <div>
                  <p className="font-semibold">Session Type</p>
                  <p>Online Consultation</p>
                </div>
                <div>
                  <p className="font-semibold">Payment</p>
                  <p>{ticketData.paymentMethod || "-"}</p>
                </div>
                <div>
                  <p className="font-semibold">Status</p>
                  <p>{bookingStatusLabel}</p>
                </div>
                <div>
                  <p className="font-semibold">Total</p>
                  <p>{formatRupiah(ticketData.totalPayment)}</p>
                </div>
                <div>
                  <p className="font-semibold">Proof</p>
                  <p>{ticketData.proofFileName || "Not uploaded"}</p>
                </div>
                <div>
                  <p className="font-semibold">Admin Verified</p>
                  <p>{ticketData.adminApproved ? "Yes" : "No"}</p>
                </div>
              </div>

              <div>
                <p className="text-sm mb-1">☐ Consultation Preview</p>
                <div className="h-16 bg-gray-200 rounded-lg p-2 text-xs text-gray-600 overflow-hidden">
                  {topic || "No topic written."}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="w-[32%] flex items-center justify-center border-l-2 border-dashed border-pink-300">
            <div className="rotate-90">
              <Barcode value={bookingCode} height={80} width={1.5} displayValue={false} />
            </div>
          </div>
        </div>
      </div>

      {/* ================= COUNTDOWN + BUTTONS ================= */}
      <div className="mt-12 text-center">
        <p className="text-xl font-medium">Your session will be started at:</p>
        <h1 className="text-4xl font-bold text-pink-500 mt-2">{timeLeft}</h1>
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
          {!isPaymentVerified
            ? "Waiting for Payment Verification"
            : sessionStatus === "upcoming"
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