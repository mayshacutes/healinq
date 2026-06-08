"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackIconButton from "@/components/BackIconButton";
import { supabase } from "@/lib/supabaseClient";

function normalizeHour(hour) {
    return hour?.replace(".", ":") || "00:00";
}

function getSessionStatus(booking) {
    const formattedHour = normalizeHour(booking.hour);
    const start = new Date(`${booking.date}T${formattedHour}:00`);
    const end = new Date(start.getTime() + (booking.sessionDuration || 60) * 60000);
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

function isPaymentVerified(booking) {
    return booking?.paymentStatus === "success";   // ← karena di database 'success'
}

function getPaymentLabel(booking) {
    if (booking?.paymentStatus === "pending") return "Menunggu Verifikasi Admin";
    if (booking?.paymentStatus === "success") return "Paid";
    return booking?.paymentStatus || "Unknown";
}

export default function MyBookingsPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const fetchBookings = async () => {
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
                    price,
                    attendance_confirmed,
                    proof_file_name,
                    session_duration,
                    payments (payment_method, payment_status, paid_at)
                `)
                .order("created_at", { ascending: false });

            if (error) {
                console.error(error);
                const saved = JSON.parse(localStorage.getItem("myBookings")) || [];
                setBookings(saved);
                return;
            }

            const mapped = data.map((item) => ({
                id: item.id,
                bookingCode: item.booking_code,
                counselorName: item.counselor_name,
                type: item.consultation_type,
                date: item.consultation_date,
                hour: item.consultation_hour,
                topic: item.topic,
                totalPayment: item.price,
                attendanceConfirmed: item.attendance_confirmed,
                proofFileName: item.proof_file_name,
                sessionDuration: item.session_duration,
                paymentMethod: item.payments?.[0]?.payment_method,
                paymentStatus: item.payments?.[0]?.payment_status || "Pending Verification",
                adminApproved: item.payments?.[0]?.payment_status === "Paid",
            }));
            setBookings(mapped);
            localStorage.setItem("myBookings", JSON.stringify(mapped));
        };

        fetchBookings();
    }, []);

    const handleViewTicket = (booking) => {
        if (!isPaymentVerified(booking)) {
            alert("Booking belum diverifikasi. Silakan tunggu konfirmasi terlebih dahulu.");
            return;
        }
        localStorage.setItem("latestTicket", JSON.stringify(booking));
        router.push(`/consultation/ticket/${booking.type?.toLowerCase() || "online"}?bookingCode=${booking.bookingCode}`);
    };

    const handleGoToChat = (booking) => {
        const status = getSessionStatus(booking);
        if (!isPaymentVerified(booking)) {
            alert("Chat belum bisa dibuka karena pembayaran masih menunggu verifikasi.");
            return;
        }
        if (status !== "ongoing") {
            alert("Room chat hanya bisa dibuka selama sesi konsultasi berlangsung.");
            return;
        }
        router.push(`/consultation/chat?bookingCode=${booking.bookingCode}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#cdeefd] to-[#a8d8f0] p-10">
            <div className="max-w-5xl mx-auto">
                <div className="mb-5"><BackIconButton to="/consultation" /></div>
                <h1 className="text-3xl font-bold text-[#0C72A6]">My Bookings</h1>
                <p className="text-gray-600 mt-2 mb-8">Review your consultation tickets, active schedules, and access your chat room from here.</p>

                {bookings.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center shadow">
                        <h2 className="text-xl font-bold text-gray-700">No Active Bookings</h2>
                        <p className="text-sm text-gray-500 mt-2">Your consultation bookings will appear here once payment is completed.</p>
                        <button onClick={() => router.push("/consultation/list")} className="mt-6 bg-[#0C72A6] text-white px-6 py-3 rounded-full">Find a Counselor</button>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {bookings.map((booking) => {
                            const status = getSessionStatus(booking);
                            const isOnline = booking.type === "online";
                            const verified = isPaymentVerified(booking);
                            const canChat = isOnline && status === "ongoing" && verified;

                            return (
                                <div key={booking.bookingCode} className="bg-white rounded-2xl p-6 shadow flex justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <h2 className="text-xl font-bold text-gray-800">{booking.counselorName}</h2>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status === "ongoing" ? "bg-green-100 text-green-600" : status === "upcoming" ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-600"}`}>
                                                {getStatusLabel(status)}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                                            <p><span className="font-semibold text-gray-800">Type:</span> <span className="capitalize">{booking.type}</span></p>
                                            <p><span className="font-semibold text-gray-800">Payment:</span> {getPaymentLabel(booking)}</p>
                                            {booking.paymentStatus === "Pending Verification" && !verified && <p className="text-xs text-yellow-700 mt-1">Menunggu verifikasi bukti transfer.</p>}
                                            <p><span className="font-semibold text-gray-800">Date:</span> {booking.date}</p>
                                            <p><span className="font-semibold text-gray-800">Hour:</span> {booking.hour} WIB</p>
                                            <p className="col-span-2"><span className="font-semibold text-gray-800">Booking Code:</span> {booking.bookingCode}</p>
                                            <p className="col-span-2"><span className="font-semibold text-gray-800">Topic:</span> {booking.topic || "-"}</p>
                                        </div>
                                    </div>
                                    <div className="w-[210px] flex flex-col gap-3 justify-center">
                                        <button onClick={() => handleViewTicket(booking)} disabled={!verified} className={`px-4 py-2 rounded-full font-semibold ${verified ? "bg-pink-300 text-pink-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}>
                                            {verified ? "View Ticket" : "Waiting Verification"}
                                        </button>
                                        {isOnline && (
                                            <button onClick={() => handleGoToChat(booking)} disabled={!canChat} className={`px-4 py-2 rounded-full font-semibold ${canChat ? "bg-[#0C72A6] text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}>
                                                {!verified ? "Waiting for Verification" : status === "upcoming" ? "Not Started Yet" : status === "finished" ? "Session Ended" : "Go to Room Chat"}
                                            </button>
                                        )}
                                        {!isOnline && <button disabled className="bg-gray-300 text-gray-500 px-4 py-2 rounded-full font-semibold cursor-not-allowed">Offline Session</button>}
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