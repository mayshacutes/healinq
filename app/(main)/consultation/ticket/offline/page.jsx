"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Barcode from "react-barcode";
import BackIconButton from "@/components/BackIconButton";

function normalizeHour(hour) {
  return hour?.replace(".", ":") || "00:00";
}

export default function TicketOfflinePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const bookingCodeFromUrl = searchParams.get("bookingCode");

  const [ticketData, setTicketData] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [attendanceConfirmed, setAttendanceConfirmed] = useState(false);

  useEffect(() => {
    const savedBookings = JSON.parse(localStorage.getItem("myBookings")) || [];
    const savedLatestTicket = localStorage.getItem("latestTicket");

    if (bookingCodeFromUrl) {
      const selectedBooking = savedBookings.find(
        (booking) => booking.bookingCode === bookingCodeFromUrl
      );

      if (selectedBooking) {
        setTicketData(selectedBooking);
        setAttendanceConfirmed(selectedBooking.attendanceConfirmed || false);
        localStorage.setItem("latestTicket", JSON.stringify(selectedBooking));
        return;
      }
    }

    if (savedLatestTicket) {
      const parsedTicket = JSON.parse(savedLatestTicket);

      setTicketData(parsedTicket);
      setAttendanceConfirmed(parsedTicket.attendanceConfirmed || false);
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
  const formattedHour = normalizeHour(hour);

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

  const handleConfirmAttendance = () => {
    if (!ticketData) return;

    const updatedTicket = {
      ...ticketData,
      attendanceConfirmed: true,
    };

    const oldBookings = JSON.parse(localStorage.getItem("myBookings")) || [];

    const updatedBookings = oldBookings.map((booking) =>
      booking.bookingCode === updatedTicket.bookingCode
        ? updatedTicket
        : booking
    );

    localStorage.setItem("latestTicket", JSON.stringify(updatedTicket));
    localStorage.setItem("myBookings", JSON.stringify(updatedBookings));

    setTicketData(updatedTicket);
    setAttendanceConfirmed(true);
    setShowPopup(false);

    alert("Attendance confirmed!");
  };

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
                    Psikolog Klinis | Offline
                  </p>

                  <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                    ✔ Paid & Verified
                  </span>
                </div>

                <div className="flex gap-2">
                  <div className="bg-pink-100 px-3 py-2 rounded-lg text-xs">
                    <p className="font-semibold">Date</p>
                    <p>{date}</p>
                  </div>

                  <div className="bg-pink-100 px-3 py-2 rounded-lg text-xs">
                    <p className="font-semibold">Time</p>
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
          Your session will start in:
        </p>

        <h1 className="text-4xl font-bold text-pink-500 mt-2">
          {timeLeft}
        </h1>

        <button
          onClick={() => {
            if (!attendanceConfirmed) {
              setShowPopup(true);
            }
          }}
          disabled={attendanceConfirmed}
          className={`mt-5 px-6 py-2 rounded-full font-semibold ${
            attendanceConfirmed
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-pink-300 text-pink-700 hover:opacity-90"
          }`}
        >
          {attendanceConfirmed ? "Confirmed" : "Confirm Attendance"}
        </button>

        <button
          onClick={() => router.push("/consultation/my-bookings")}
          className="block mx-auto mt-3 px-6 py-2 bg-white text-[#0C72A6] rounded-full font-semibold hover:opacity-90"
        >
          My Bookings
        </button>
      </div>

      {/* ================= POPUP ================= */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[350px] text-center shadow-lg">
            <h2 className="text-lg font-bold mb-3">
              Confirm Your Attendance
            </h2>

            <p className="text-sm text-gray-600 mb-5">
              By confirming your attendance, you are committing to attend this
              session. Failure to show up may result in restrictions or
              suspension of your account.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmAttendance}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}