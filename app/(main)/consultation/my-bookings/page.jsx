"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackIconButton from "@/components/BackIconButton";
import { supabase } from "@/lib/supabaseClient";

function normalizeHour(hour) {
  return hour?.replace(".", ":") || "00:00";
}

function getSessionStatus(consultation) {
  const formattedHour = normalizeHour(consultation.consultation_hour);
  const start = new Date(`${consultation.consultation_date}T${formattedHour}:00`);
  const end = new Date(start.getTime() + (consultation.session_duration || 60) * 60000);
  const now = new Date();
  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "ongoing";
  return "finished";
}

function getStatusLabel(status) {
  if (status === "upcoming") return "Upcoming";
  if (status === "ongoing") return "Ongoing";
  return "Finished";
}

function isPaymentVerified(consultation) {
  const pay = consultation.payments?.[0];
  return pay?.payment_status === "paid";
}

function formatDate(d) {
  if (!d) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  }).format(new Date(d));
}

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoading(false); return; }

      const { data, error } = await supabase
        .from("consultations")
        .select(`
          id,
          booking_code,
          counselor_name,
          consultation_type,
          consultation_date,
          consultation_hour,
          topic,
          status,
          session_duration,
          proof_uploaded,
          chat_rooms ( id ),
          payments ( payment_status, payment_method )
        `)
        .eq("client_id", user.id)
        .order("consultation_date", { ascending: false });

      if (error) {
        console.error("Error fetching bookings:", error);
        setIsLoading(false);
        return;
      }

      setBookings(data || []);
      setIsLoading(false);
    };

    fetchBookings();
  }, []);

  const handleGoToChat = (booking) => {
    const sessionStatus = getSessionStatus(booking);
    const verified = isPaymentVerified(booking);
    const roomId = booking.chat_rooms?.[0]?.id;

    if (!verified) {
      alert("Chat belum bisa dibuka karena pembayaran masih menunggu verifikasi.");
      return;
    }
    if (sessionStatus !== "ongoing") {
      alert("Room chat hanya bisa dibuka selama sesi konsultasi berlangsung.");
      return;
    }
    if (!roomId) {
      alert("Room chat belum tersedia untuk sesi ini.");
      return;
    }

    router.push(`/consultation/chat?roomId=${roomId}&bookingCode=${booking.booking_code}`);
  };

  const handleViewTicket = (booking) => {
    const verified = isPaymentVerified(booking);
    if (!verified) {
      alert("Booking belum diverifikasi. Silakan tunggu konfirmasi admin.");
      return;
    }

    // Simpan ke localStorage untuk halaman tiket (tiket page masih baca dari sana)
    const ticketData = {
      bookingCode: booking.booking_code,
      counselorName: booking.counselor_name,
      type: booking.consultation_type,
      date: booking.consultation_date,
      hour: booking.consultation_hour,
      topic: booking.topic,
      paymentStatus: "Paid",
    };
    localStorage.setItem("latestTicket", JSON.stringify(ticketData));
    router.push(`/consultation/ticket/${booking.consultation_type || "online"}?bookingCode=${booking.booking_code}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#cdeefd] to-[#a8d8f0] flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0C72A6] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#cdeefd] to-[#a8d8f0] p-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-5">
          <BackIconButton to="/consultation" />
        </div>

        <h1 className="text-3xl font-bold text-[#0C72A6]">My Bookings</h1>
        <p className="text-gray-600 mt-2 mb-8">
          Lihat riwayat booking, jadwal aktif, dan akses room chat dari sini.
        </p>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow">
            <h2 className="text-xl font-bold text-gray-700">Belum Ada Booking</h2>
            <p className="text-sm text-gray-500 mt-2">
              Booking konsultasi kamu akan muncul di sini setelah pembayaran selesai.
            </p>
            <button
              onClick={() => router.push("/consultation/list")}
              className="mt-6 bg-[#0C72A6] text-white px-6 py-3 rounded-full"
            >
              Cari Konselor
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {bookings.map((booking) => {
              const sessionStatus = getSessionStatus(booking);
              const isOnline = booking.consultation_type === "online";
              const verified = isPaymentVerified(booking);
              const canChat = isOnline && sessionStatus === "ongoing" && verified;
              const payStatus = booking.payments?.[0]?.payment_status || "pending";

              return (
                <div key={booking.id} className="bg-white rounded-2xl p-6 shadow flex justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h2 className="text-xl font-bold text-gray-800">{booking.counselor_name}</h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        sessionStatus === "ongoing" ? "bg-green-100 text-green-600" :
                        sessionStatus === "upcoming" ? "bg-blue-100 text-blue-600" :
                        "bg-gray-200 text-gray-600"
                      }`}>
                        {getStatusLabel(sessionStatus)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                      <p><span className="font-semibold text-gray-800">Tipe:</span>{" "}
                        <span className="capitalize">{booking.consultation_type}</span>
                      </p>
                      <p><span className="font-semibold text-gray-800">Pembayaran:</span>{" "}
                        <span className={`capitalize font-medium ${
                          payStatus === "paid" ? "text-green-600" :
                          payStatus === "failed" ? "text-red-500" : "text-yellow-600"
                        }`}>
                          {payStatus === "paid" ? "Terverifikasi" :
                           payStatus === "failed" ? "Gagal" : "Menunggu Verifikasi"}
                        </span>
                      </p>
                      <p><span className="font-semibold text-gray-800">Tanggal:</span>{" "}
                        {formatDate(booking.consultation_date)}
                      </p>
                      <p><span className="font-semibold text-gray-800">Jam:</span>{" "}
                        {booking.consultation_hour} WIB
                      </p>
                      <p className="col-span-2">
                        <span className="font-semibold text-gray-800">Kode Booking:</span>{" "}
                        <span className="font-mono">{booking.booking_code}</span>
                      </p>
                      <p className="col-span-2">
                        <span className="font-semibold text-gray-800">Topik:</span>{" "}
                        {booking.topic || "-"}
                      </p>
                      {!verified && booking.proof_uploaded && (
                        <p className="col-span-2 text-xs text-yellow-700">
                          Bukti transfer sudah diupload, menunggu verifikasi admin.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="w-[210px] flex flex-col gap-3 justify-center">
                    <button
                      onClick={() => handleViewTicket(booking)}
                      disabled={!verified}
                      className={`px-4 py-2 rounded-full font-semibold text-sm ${
                        verified ? "bg-pink-300 text-pink-700 hover:bg-pink-400"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {verified ? "Lihat Tiket" : "Menunggu Verifikasi"}
                    </button>

                    {isOnline && (
                      <button
                        onClick={() => handleGoToChat(booking)}
                        disabled={!canChat}
                        className={`px-4 py-2 rounded-full font-semibold text-sm ${
                          canChat ? "bg-[#0C72A6] text-white hover:bg-[#095f8c]"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {!verified ? "Menunggu Verifikasi" :
                         sessionStatus === "upcoming" ? "Belum Dimulai" :
                         sessionStatus === "finished" ? "Sesi Berakhir" :
                         "Masuk Room Chat"}
                      </button>
                    )}

                    {!isOnline && (
                      <button disabled
                        className="bg-gray-200 text-gray-500 px-4 py-2 rounded-full font-semibold text-sm cursor-not-allowed">
                        Sesi Offline
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}